package com.backend1.controller;

import com.backend1.model.MongoDocuments.OrderDocument;
import com.backend1.model.MongoDocuments.PaymentSessionDocument;
import com.backend1.service.InventoryService;
import com.backend1.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Map;

/**
 * StripeWebhookController
 *
 * Handles incoming Stripe webhook events and updates order/payment state accordingly.
 *
 * Supported events:
 *  - checkout.session.completed  → mark payment as paid, commit inventory
 *  - checkout.session.expired    → mark payment as expired, release inventory
 *  - payment_intent.payment_failed → mark payment as failed
 *
 * Stripe sends a `Stripe-Signature` header. We verify it using HMAC-SHA256 with
 * the webhook signing secret (configured in application.yml as app.stripe.webhook-secret).
 *
 * In development/test mode, set STRIPE_WEBHOOK_SECRET=whsec_placeholder and signature
 * verification is skipped when the secret starts with "whsec_placeholder".
 *
 * To test locally:
 *   stripe listen --forward-to localhost:8080/api/payments/stripe/webhook
 */
@RestController
@RequestMapping("/api/payments/stripe")
public class StripeWebhookController {

    private static final Logger log = LoggerFactory.getLogger(StripeWebhookController.class);

    @Value("${app.stripe.webhook-secret:whsec_placeholder}")
    private String webhookSecret;

    private final MongoTemplate     mongoTemplate;
    private final InventoryService  inventoryService;
    private final AuditService      auditService;

    public StripeWebhookController(MongoTemplate mongoTemplate,
                                   InventoryService inventoryService,
                                   AuditService auditService) {
        this.mongoTemplate    = mongoTemplate;
        this.inventoryService = inventoryService;
        this.auditService     = auditService;
    }

    // ── Webhook entry-point ───────────────────────────────────────────────────

    @PostMapping("/webhook")
    public ResponseEntity<Map<String, String>> handleWebhook(
            @RequestBody String rawBody,
            @RequestHeader(name = "Stripe-Signature", required = false) String sigHeader,
            HttpServletRequest request
    ) {
        // Verify signature (skip in dev/placeholder mode)
        if (!webhookSecret.startsWith("whsec_placeholder")) {
            if (sigHeader == null || !verifySignature(rawBody, sigHeader, webhookSecret)) {
                log.warn("Stripe webhook signature verification failed");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid signature"));
            }
        }

        // Parse event type and object — minimal JSON extraction (no Stripe SDK required)
        String eventType    = extractField(rawBody, "type");
        String sessionId    = extractNestedField(rawBody, "\"id\"");    // data.object.id
        String paymentStatus = extractNestedField(rawBody, "\"payment_status\"");

        log.info("Stripe webhook received: type={} session={}", eventType, sessionId);

        try {
            switch (eventType != null ? eventType : "") {
                case "checkout.session.completed"  -> handleCheckoutCompleted(sessionId, paymentStatus);
                case "checkout.session.expired"    -> handleCheckoutExpired(sessionId);
                case "payment_intent.payment_failed" -> handlePaymentFailed(sessionId);
                default -> log.debug("Unhandled Stripe event: {}", eventType);
            }
        } catch (Exception e) {
            log.error("Error processing Stripe webhook event {}: {}", eventType, e.getMessage(), e);
            // Return 200 anyway — Stripe retries on 4xx/5xx which would cause duplicate processing
        }

        return ResponseEntity.ok(Map.of("received", "true"));
    }

    // ── Event handlers ────────────────────────────────────────────────────────

    private void handleCheckoutCompleted(String sessionId, String paymentStatus) {
        if (sessionId == null) return;

        PaymentSessionDocument session = mongoTemplate.findById(sessionId, PaymentSessionDocument.class);
        if (session == null) {
            log.warn("Stripe webhook: no session found for id={}", sessionId);
            return;
        }

        if ("paid".equalsIgnoreCase(session.getPaymentStatus())) {
            log.info("Session {} already marked as paid, skipping", sessionId);
            return;
        }

        // Update payment session
        session.setStatus("complete");
        session.setPaymentStatus("paid");
        session.setUpdatedAt(LocalDateTime.now());
        mongoTemplate.save(session);

        // Update order
        OrderDocument order = mongoTemplate.findById(session.getOrderId(), OrderDocument.class);
        if (order != null && !"paid".equalsIgnoreCase(order.getStatus())) {
            inventoryService.commitOrderReservations(order);
            order.setStatus("paid");
            order.setTrackingStatus("ready_for_fulfillment");
            order.setUpdatedAt(LocalDateTime.now());
            appendStatusHistory(order, "paid", "ready_for_fulfillment", "Payment confirmed via Stripe webhook");
            mongoTemplate.save(order);
            auditService.log("stripe-webhook", "ORDER_PAID", "Order", String.valueOf(order.getId()), "Payment confirmed via Stripe webhook");
            log.info("Order {} marked as paid via Stripe webhook", order.getId());
        }
    }

    private void handleCheckoutExpired(String sessionId) {
        if (sessionId == null) return;

        PaymentSessionDocument session = mongoTemplate.findById(sessionId, PaymentSessionDocument.class);
        if (session == null) return;

        if ("expired".equalsIgnoreCase(session.getStatus())) return;

        session.setStatus("expired");
        session.setUpdatedAt(LocalDateTime.now());
        mongoTemplate.save(session);

        OrderDocument order = mongoTemplate.findById(session.getOrderId(), OrderDocument.class);
        if (order != null && !"payment_expired".equalsIgnoreCase(order.getStatus())
                && !"paid".equalsIgnoreCase(order.getStatus())) {
            inventoryService.releaseOrderReservations(order);
            order.setStatus("payment_expired");
            order.setTrackingStatus("reservation_released");
            order.setUpdatedAt(LocalDateTime.now());
            appendStatusHistory(order, "payment_expired", "reservation_released",
                    "Stripe checkout session expired — inventory released");
            mongoTemplate.save(order);
            auditService.log("stripe-webhook", "CHECKOUT_EXPIRED", "Order", String.valueOf(order.getId()), "Checkout session expired");
            log.info("Order {} marked as expired via Stripe webhook", order.getId());
        }
    }

    private void handlePaymentFailed(String paymentIntentId) {
        // Find order by matching payment_intent in session metadata if needed
        // For now log and let retry flow handle it
        log.warn("Payment failed for intent: {}", paymentIntentId);
        auditService.log("stripe-webhook", "PAYMENT_FAILED", "PaymentIntent", paymentIntentId != null ? paymentIntentId : "unknown", "Payment intent failed");
    }

    // ── Signature verification ────────────────────────────────────────────────

    /**
     * Verifies a Stripe webhook signature.
     * See: https://stripe.com/docs/webhooks/signatures
     *
     * Header format: t=TIMESTAMP,v1=SIGNATURE
     */
    static boolean verifySignature(String payload, String sigHeader, String secret) {
        try {
            String timestamp  = null;
            String v1Sig      = null;
            for (String part : sigHeader.split(",")) {
                if (part.startsWith("t="))  timestamp = part.substring(2);
                if (part.startsWith("v1=")) v1Sig     = part.substring(3);
            }
            if (timestamp == null || v1Sig == null) return false;

            String signedPayload = timestamp + "." + payload;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(
                    secret.replace("whsec_", "")
                          .getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"
            ));
            byte[] computed = mac.doFinal(signedPayload.getBytes(StandardCharsets.UTF_8));
            String computedHex = HexFormat.of().formatHex(computed);
            return computedHex.equals(v1Sig);
        } catch (Exception e) {
            return false;
        }
    }

    // ── Minimal JSON extraction (no extra library needed) ────────────────────

    /** Extract top-level string field, e.g. "type" → "checkout.session.completed" */
    private static String extractField(String json, String fieldName) {
        var pattern = java.util.regex.Pattern.compile(
                "\"" + fieldName + "\"\\s*:\\s*\"([^\"]+)\""
        );
        var matcher = pattern.matcher(json);
        return matcher.find() ? matcher.group(1) : null;
    }

    /** Extract the first occurrence of a field anywhere in the document */
    private static String extractNestedField(String json, String rawKey) {
        var pattern = java.util.regex.Pattern.compile(
                rawKey + "\\s*:\\s*\"([^\"]+)\""
        );
        var matcher = pattern.matcher(json);
        return matcher.find() ? matcher.group(1) : null;
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private void appendStatusHistory(OrderDocument order, String status, String trackingStatus, String note) {
        if (order.getStatusHistory() == null) {
            order.setStatusHistory(new java.util.ArrayList<>());
        }
        var event = new com.backend1.model.MongoDocuments.OrderStatusEventDocument(
                status, trackingStatus, note, LocalDateTime.now()
        );
        order.getStatusHistory().add(event);
    }
}
