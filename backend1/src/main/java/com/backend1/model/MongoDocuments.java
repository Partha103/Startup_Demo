package com.backend1.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public final class MongoDocuments {

    private MongoDocuments() {}

    // ─────────────────────────────────────────────────────────────
    // COLLECTIONS
    // ─────────────────────────────────────────────────────────────

    @Document("collections")
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CatalogCollectionDocument {
        @Id
        private Long id;
        private Integer displayOrder;
        private String name;
        private String description;
        private String image;
    }

    // ─────────────────────────────────────────────────────────────
    // PRODUCTS
    // ─────────────────────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductVariantDocument {
        private String sku;
        private String size;
        private String color;

        @Field(targetType = FieldType.DECIMAL128)
        private BigDecimal price;
    }

    @Document("products")
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductDocument {
        @Id
        private Long id;

        @Indexed
        private String sku;

        @Indexed
        private Long collectionId;

        private String name;
        private String description;

        @Field(targetType = FieldType.DECIMAL128)
        private BigDecimal price;

        @Indexed
        private String category;

        private String subcategory;
        private String fit;
        private String fabric;
        private String status;

        private List<String> colors;
        private List<String> sizes;
        private List<String> images;
        private List<String> regions;
        private List<ProductVariantDocument> variants;

        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    // ─────────────────────────────────────────────────────────────
    // USERS
    // ─────────────────────────────────────────────────────────────

    @Document("users")
    @Data
    @NoArgsConstructor
    public static class UserDocument {
        @Id
        private Long id;

        private String name;

        @Indexed(unique = true)
        private String email;

        private String passwordHash;
        private List<String> roles;
        private String region;

        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public UserDocument(Long id, String name, String email, String passwordHash,
                            List<String> roles, String region, LocalDateTime createdAt) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.passwordHash = passwordHash;
            this.roles = roles;
            this.region = region;
            this.createdAt = createdAt;
            this.updatedAt = createdAt;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // SESSION
    // ─────────────────────────────────────────────────────────────

    @Document("sessions")
    @Data
    @NoArgsConstructor
    public static class SessionDocument {
        @Id
        private String token;

        @Indexed
        private Long userId;

        private String externalSessionId;
        private LocalDateTime createdAt;
        private LocalDateTime expiresAt;

        public SessionDocument(String token, Long userId, String externalSessionId,
                               LocalDateTime createdAt, LocalDateTime expiresAt) {
            this.token = token;
            this.userId = userId;
            this.externalSessionId = externalSessionId;
            this.createdAt = createdAt;
            this.expiresAt = expiresAt;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // CART
    // ─────────────────────────────────────────────────────────────

    @Document("cart_items")
    @CompoundIndex(def = "{'userId': 1, 'productId': 1, 'size': 1, 'color': 1}", unique = true)
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemDocument {
        @Id
        private Long id;

        @Indexed
        private Long userId;

        private Long productId;
        private String size;
        private String color;
        private Integer quantity;

        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    // ─────────────────────────────────────────────────────────────
    // WISHLIST
    // ─────────────────────────────────────────────────────────────

    @Document("wishlist_items")
    @CompoundIndex(def = "{'userId': 1, 'productId': 1}", unique = true)
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WishlistItemDocument {
        @Id
        private Long id;

        @Indexed
        private Long userId;

        private Long productId;
        private LocalDateTime createdAt;
    }

    // ─────────────────────────────────────────────────────────────
    // ORDER
    // ─────────────────────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderStatusEventDocument {
        private String status;
        private String trackingStatus;
        private String note;
        private LocalDateTime createdAt;
    }

    @Document("orders")
    @Data
    @NoArgsConstructor
    public static class OrderDocument {
        @Id
        private Long id;

        @Indexed
        private Long userId;

        @Field(targetType = FieldType.DECIMAL128)
        private BigDecimal totalAmount;

        private String status;
        private String paymentMethod;
        private String trackingStatus;
        private String fulfillmentSource;
        private String fulfillmentType;

        private ShippingAddressDocument shippingAddress;

        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        private List<OrderItemDocument> items;
        private List<OrderStatusEventDocument> statusHistory;
    }

    // ─────────────────────────────────────────────────────────────
    // ORDER ITEMS
    // ─────────────────────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    public static class ShippingAddressDocument {
        private String name;
        private String address;
        private String city;
        private String postalCode;
        private String country;
    }

    @Data
    @NoArgsConstructor
    public static class OrderItemDocument {
        private Long orderItemId;
        private Long productId;
        private String name;
        private Integer quantity;

        @Field(targetType = FieldType.DECIMAL128)
        private BigDecimal price;

        private String size;
        private String color;
        private String sourceLocation;
    }

    // ─────────────────────────────────────────────────────────────
    // INVENTORY
    // ─────────────────────────────────────────────────────────────

    @Document("inventory")
    @CompoundIndex(def = "{'productId': 1, 'size': 1, 'color': 1, 'locationCode': 1}", unique = true)
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventoryDocument {
        @Id
        private String id;

        @Indexed
        private Long productId;

        @Indexed
        private String sku;

        private String productName;
        private String size;
        private String color;
        private String locationCode;
        private String locationType;
        private String region;

        private Integer availableQuantity;
        private Integer reservedQuantity;
        private Integer soldQuantity;
        private Integer reorderThreshold;

        private LocalDateTime updatedAt;
    }

    // ─────────────────────────────────────────────────────────────
    // PAYMENT SESSION (FIXED ✅)
    // ─────────────────────────────────────────────────────────────

    @Document("payment_sessions")
    @Data
    @NoArgsConstructor
    public static class PaymentSessionDocument {
        @Id
        private String id;

        @Indexed
        private Long userId;

        private Long orderId;

        @Field(targetType = FieldType.DECIMAL128)
        private BigDecimal amount;

        private String currency;
        private String status;
        private String paymentStatus;
        private String checkoutUrl;

        private LocalDateTime createdAt;
        private LocalDateTime expiresAt;

        // ✅ FIX ADDED
        private LocalDateTime updatedAt;

        public PaymentSessionDocument(String id, Long userId, Long orderId,
                                      BigDecimal amount, String currency,
                                      String status, String paymentStatus,
                                      String checkoutUrl,
                                      LocalDateTime createdAt,
                                      LocalDateTime expiresAt) {
            this.id = id;
            this.userId = userId;
            this.orderId = orderId;
            this.amount = amount;
            this.currency = currency;
            this.status = status;
            this.paymentStatus = paymentStatus;
            this.checkoutUrl = checkoutUrl;
            this.createdAt = createdAt;
            this.expiresAt = expiresAt;
            this.updatedAt = createdAt; // sensible default
        }
    }

    // ─────────────────────────────────────────────────────────────
    // AUDIT
    // ─────────────────────────────────────────────────────────────

    @Document("audit_logs")
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuditLogDocument {
        @Id
        private String id;

        private String actorEmail;
        private String action;
        private String targetType;
        private String targetId;
        private String details;

        private LocalDateTime createdAt;
    }

    // ─────────────────────────────────────────────────────────────
    // COUNTER
    // ─────────────────────────────────────────────────────────────

    @Document("counters")
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CounterDocument {
        @Id
        private String id;
        private Long value;
    }
}