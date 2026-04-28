package com.backend1.service;

import com.backend1.dto.ApiModels.CheckoutRequest;
import com.backend1.dto.ApiModels.CheckoutSessionResponse;
import com.backend1.dto.ApiModels.CreateOrderRequest;
import com.backend1.dto.ApiModels.OrderItemRequest;
import com.backend1.dto.ApiModels.OrderItemResponse;
import com.backend1.dto.ApiModels.OrderResponse;
import com.backend1.dto.ApiModels.OrderStatusEventResponse;
import com.backend1.dto.ApiModels.OrderTrackingUpdateRequest;
import com.backend1.dto.ApiModels.PaymentStatusResponse;
import com.backend1.dto.ApiModels.ShippingAddressRequest;
import com.backend1.dto.ApiModels.ShippingAddressResponse;
import com.backend1.model.MongoDocuments.OrderDocument;
import com.backend1.model.MongoDocuments.OrderItemDocument;
import com.backend1.model.MongoDocuments.OrderStatusEventDocument;
import com.backend1.model.MongoDocuments.PaymentSessionDocument;
import com.backend1.model.MongoDocuments.ProductDocument;
import com.backend1.model.MongoDocuments.ProductVariantDocument;
import com.backend1.model.MongoDocuments.ShippingAddressDocument;
import com.backend1.model.MongoDocuments.UserDocument;
import com.backend1.security.ApiException;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class OrderService {
    private final MongoTemplate mongoTemplate;
    private final MongoSequenceService sequenceService;
    private final ProductService productService;
    private final InventoryService inventoryService;
    private final AuditService auditService;

    public OrderService(MongoTemplate mongoTemplate, MongoSequenceService sequenceService,
                        ProductService productService, InventoryService inventoryService,
                        AuditService auditService) {
        this.mongoTemplate = mongoTemplate;
        this.sequenceService = sequenceService;
        this.productService = productService;
        this.inventoryService = inventoryService;
        this.auditService = auditService;
    }

    public List<OrderResponse> findOrders(long userId) {
        Query query = Query.query(Criteria.where("userId").is(userId))
                .with(Sort.by(Sort.Direction.DESC, "createdAt", "_id"));
        return mongoTemplate.find(query, OrderDocument.class).stream()
                .map(this::toOrderResponse)
                .toList();
    }

    public long createOrder(long userId, CreateOrderRequest request) {
        if (request.items() == null || request.items().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Order must include at least one item");
        }
        if (request.shipping_address() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Shipping address is required");
        }

        ShippingAddressRequest shipping = request.shipping_address();
        ShippingAddressDocument shippingAddress = new ShippingAddressDocument(
                requireText(shipping.name(), "Shipping name"),
                requireText(shipping.address(), "Shipping address"),
                requireText(shipping.city(), "Shipping city"),
                trimToNull(shipping.postal_code()),
                trimToNull(shipping.country())
        );

        List<OrderItemDocument> items = new ArrayList<>();
        List<InventoryService.ReservedInventory> reservations = new ArrayList<>();

        for (OrderItemRequest item : request.items()) {
            ProductDocument product = productService.getActiveProductDocumentOrThrow(requireId(item.product_id(), "Product"));
            String size = requireText(item.size(), "Size");
            String color = requireText(item.color(), "Color");
            int quantity = requireQuantity(item.quantity());

            ProductVariantDocument variant = productService.requireVariant(product, size, color);
            inventoryService.assertVariantAvailable(product.getId(), size, color, quantity);
            InventoryService.ReservedInventory reservation = inventoryService.reserveVariant(product, size, color, quantity);
            reservations.add(reservation);

            items.add(new OrderItemDocument(
                    sequenceService.nextId("order_items"),
                    product.getId(),
                    product.getName(),
                    quantity,
                    variant.getPrice(),
                    size,
                    color,
                    reservation.locationCode()
            ));
        }

        BigDecimal totalAmount = items.stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (request.total_amount() != null && totalAmount.compareTo(request.total_amount()) != 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Order total does not match current pricing");
        }

        long orderId = sequenceService.nextId("orders");
        String fulfillmentSource = reservations.stream().map(InventoryService.ReservedInventory::locationCode).distinct().count() == 1
                ? reservations.getFirst().locationCode()
                : "MULTI_LOCATION";
        String fulfillmentType = reservations.stream().map(InventoryService.ReservedInventory::locationType).distinct().count() == 1
                ? reservations.getFirst().locationType().toLowerCase(Locale.ROOT)
                : "split";
        LocalDateTime now = LocalDateTime.now();

        OrderDocument order = new OrderDocument(
                orderId,
                userId,
                totalAmount,
                "reserved",
                requireText(request.payment_method(), "Payment method"),
                "stock_reserved",
                fulfillmentSource,
                fulfillmentType,
                shippingAddress,
                now,
                now,
                items,
                new ArrayList<>(List.of(new OrderStatusEventDocument(
                        "reserved",
                        "stock_reserved",
                        "Inventory reserved and awaiting payment",
                        now
                )))
        );
        mongoTemplate.save(order);
        return orderId;
    }

    public CheckoutSessionResponse createCheckoutSession(long userId, CheckoutRequest request, String origin) {
        long orderId = requireId(request.order_id(), "Order");
        OrderDocument order = findOrderForUser(userId, orderId);
        if ("paid".equalsIgnoreCase(order.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "Order is already paid");
        }

        String sessionId = UUID.randomUUID().toString();
        String checkoutUrl = normalizeOrigin(origin) + "/checkout/success?session_id=" + sessionId;
        PaymentSessionDocument session = new PaymentSessionDocument(
                sessionId,
                userId,
                orderId,
                order.getTotalAmount(),
                requireText(request.currency(), "Currency").toLowerCase(Locale.ROOT),
                "open",
                "unpaid",
                checkoutUrl,
                LocalDateTime.now(),
                LocalDateTime.now().plusMinutes(30)
        );
        mongoTemplate.save(session);
        appendStatusHistory(order, order.getStatus(), "payment_pending", "Checkout session created");
        mongoTemplate.save(order);
        return new CheckoutSessionResponse(sessionId, checkoutUrl);
    }

    public PaymentStatusResponse getPaymentStatus(long userId, String sessionId) {
        PaymentSessionDocument session = mongoTemplate.findOne(
                Query.query(new Criteria().andOperator(
                        Criteria.where("_id").is(sessionId),
                        Criteria.where("userId").is(userId)
                )),
                PaymentSessionDocument.class
        );
        if (session == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Payment session not found");
        }

        OrderDocument order = mongoTemplate.findById(session.getOrderId(), OrderDocument.class);

        if (!"paid".equalsIgnoreCase(session.getPaymentStatus())
                && session.getExpiresAt() != null
                && session.getExpiresAt().isBefore(LocalDateTime.now())) {
            session.setStatus("expired");
            mongoTemplate.save(session);

            if (order != null && !"payment_expired".equalsIgnoreCase(order.getStatus())
                    && !"paid".equalsIgnoreCase(order.getStatus())) {
                inventoryService.releaseOrderReservations(order);
                order.setStatus("payment_expired");
                order.setTrackingStatus("reservation_released");
                order.setUpdatedAt(LocalDateTime.now());
                appendStatusHistory(order, "payment_expired", "reservation_released", "Payment expired and stock was released");
                mongoTemplate.save(order);
            }
            return new PaymentStatusResponse(session.getId(), session.getOrderId(), "expired", session.getPaymentStatus());
        }

        if (!"paid".equalsIgnoreCase(session.getPaymentStatus())) {
            session.setStatus("complete");
            session.setPaymentStatus("paid");
            mongoTemplate.save(session);

            if (order != null && !"paid".equalsIgnoreCase(order.getStatus())) {
                inventoryService.commitOrderReservations(order);
                order.setStatus("paid");
                order.setTrackingStatus("ready_for_fulfillment");
                order.setUpdatedAt(LocalDateTime.now());
                appendStatusHistory(order, "paid", "ready_for_fulfillment", "Payment confirmed and stock committed");
                mongoTemplate.save(order);
            }
            return new PaymentStatusResponse(session.getId(), session.getOrderId(), "complete", "paid");
        }

        return new PaymentStatusResponse(session.getId(), session.getOrderId(), session.getStatus(), session.getPaymentStatus());
    }

    public List<OrderResponse> findAdminOrders() {
        return mongoTemplate.find(new Query().with(Sort.by(Sort.Direction.DESC, "createdAt", "_id")), OrderDocument.class)
                .stream()
                .map(this::toOrderResponse)
                .toList();
    }

    public OrderResponse updateOrderTracking(long orderId, OrderTrackingUpdateRequest request, UserDocument actor) {
        OrderDocument order = mongoTemplate.findById(orderId, OrderDocument.class);
        if (order == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Order not found");
        }
        if (!StringUtils.hasText(request.status()) && !StringUtils.hasText(request.tracking_status())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Status or tracking status is required");
        }

        if (StringUtils.hasText(request.status())) {
            order.setStatus(request.status().trim().toLowerCase(Locale.ROOT));
        }
        if (StringUtils.hasText(request.tracking_status())) {
            order.setTrackingStatus(request.tracking_status().trim().toLowerCase(Locale.ROOT));
        }
        order.setUpdatedAt(LocalDateTime.now());
        appendStatusHistory(
                order,
                order.getStatus(),
                order.getTrackingStatus(),
                StringUtils.hasText(request.note()) ? request.note().trim() : "Order tracking updated by admin"
        );
        mongoTemplate.save(order);
        auditService.log(actor.getEmail(), "ORDER_TRACKING_UPDATED", "order", String.valueOf(orderId),
                StringUtils.hasText(request.note()) ? request.note().trim() : order.getTrackingStatus());
        return toOrderResponse(order);
    }

    public int countOpenOrders() {
        return (int) mongoTemplate.find(new Query(), OrderDocument.class).stream()
                .filter(order -> !List.of("delivered", "cancelled", "payment_expired").contains(order.getStatus()))
                .count();
    }

    private OrderDocument findOrderForUser(long userId, long orderId) {
        OrderDocument order = mongoTemplate.findOne(
                Query.query(new Criteria().andOperator(
                        Criteria.where("_id").is(orderId),
                        Criteria.where("userId").is(userId)
                )),
                OrderDocument.class
        );
        if (order == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Order not found");
        }
        return order;
    }

    private void appendStatusHistory(OrderDocument order, String status, String trackingStatus, String note) {
        if (order.getStatusHistory() == null) {
            order.setStatusHistory(new ArrayList<>());
        }
        order.getStatusHistory().add(new OrderStatusEventDocument(status, trackingStatus, note, LocalDateTime.now()));
    }

    private OrderResponse toOrderResponse(OrderDocument order) {
        ShippingAddressDocument shipping = order.getShippingAddress();
        List<OrderStatusEventResponse> statusHistory = order.getStatusHistory() == null ? List.of()
                : order.getStatusHistory().stream()
                .map(event -> new OrderStatusEventResponse(
                        event.getStatus(),
                        event.getTrackingStatus(),
                        event.getNote(),
                        event.getCreatedAt()
                ))
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getPaymentMethod(),
                new ShippingAddressResponse(
                        shipping.getName(),
                        shipping.getAddress(),
                        shipping.getCity(),
                        shipping.getPostalCode(),
                        shipping.getCountry()
                ),
                order.getCreatedAt(),
                order.getItems().stream()
                        .map(item -> new OrderItemResponse(
                                item.getOrderItemId(),
                                item.getProductId(),
                                item.getName(),
                                item.getQuantity(),
                                item.getPrice(),
                                item.getSize(),
                                item.getColor(),
                                item.getSourceLocation()
                        ))
                        .toList(),
                order.getTrackingStatus(),
                order.getFulfillmentSource(),
                order.getFulfillmentType(),
                statusHistory
        );
    }

    private String requireText(String value, String label) {
        if (!StringUtils.hasText(value)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, label + " is required");
        }
        return value.trim();
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private long requireId(Long value, String label) {
        if (value == null || value <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, label + " is required");
        }
        return value;
    }

    private int requireQuantity(Integer quantity) {
        if (quantity == null || quantity < 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Quantity must be at least 1");
        }
        return quantity;
    }

    private String normalizeOrigin(String origin) {
        if (!StringUtils.hasText(origin)) {
            return "http://localhost:3000";
        }
        String trimmed = origin.trim();
        while (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }
}
