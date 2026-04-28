package com.backend1.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public final class ApiModels {

    private ApiModels() {}

    public record ProductFilters(
            String category,
            Long collectionId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            List<String> sizes,
            List<String> colors,
            List<String> fits
    ) {}

    // ── Auth ─────────────────────────────────────────────────────────────────

    public record AuthRequest(String name, String email, String password) {}

    /** Body for POST /api/auth/google */
    public record GoogleAuthRequest(String access_token) {}

    public record UserResponse(Long user_id, String name, String email, List<String> roles, String region) {}

    public record AuthResponse(String session_token, UserResponse user) {}

    public record AuthSessionResponse(
            String session_token, Long user_id, String name, String email, List<String> roles, String region
    ) {}

    // ── Catalogue ────────────────────────────────────────────────────────────

    public record CollectionResponse(Long collection_id, String name, String description, String image, int products_count) {}

    public record ProductVariantResponse(
            String sku, String size, String color, BigDecimal price,
            int available_stock, int reserved_stock, boolean available
    ) {}

    public record ProductResponse(
            Long product_id, Long collection_id, String sku, String name, String description,
            BigDecimal price, String category, String subcategory, String fit, String fabric,
            String status, List<String> colors, List<String> sizes, List<String> images,
            List<String> regions, int total_available, List<ProductVariantResponse> variants
    ) {}

    // ── Cart ─────────────────────────────────────────────────────────────────

    public record AddToCartRequest(Long product_id, String size, String color, Integer quantity) {}

    public record CartItemResponse(
            Long cart_item_id, Long product_id, String size, String color, int quantity, int available_stock
    ) {}

    public record WishlistItemResponse(Long wishlist_id, Long product_id) {}

    // ── Orders ───────────────────────────────────────────────────────────────

    public record OrderItemRequest(Long product_id, String name, Integer quantity, BigDecimal price, String size, String color) {}

    public record ShippingAddressRequest(String name, String address, String city, String postal_code, String country) {}

    public record CreateOrderRequest(
            List<OrderItemRequest> items, BigDecimal total_amount,
            ShippingAddressRequest shipping_address, String payment_method
    ) {}

    public record ShippingAddressResponse(String name, String address, String city, String postal_code, String country) {}

    public record OrderStatusEventResponse(String status, String tracking_status, String note, LocalDateTime created_at) {}

    public record OrderItemResponse(
            Long order_item_id, Long product_id, String name, int quantity, BigDecimal price,
            String size, String color, String source_location
    ) {}

    public record OrderResponse(
            Long order_id, BigDecimal total_amount, String status, String payment_method,
            ShippingAddressResponse shipping_address, LocalDateTime created_at,
            List<OrderItemResponse> items, String tracking_status, String fulfillment_source,
            String fulfillment_type, List<OrderStatusEventResponse> status_history
    ) {}

    public record CheckoutRequest(Long order_id, BigDecimal amount, String currency) {}

    public record CheckoutSessionResponse(
            String session_id,
            @JsonProperty("url") String checkout_url
    ) {}

    public record PaymentStatusResponse(String session_id, Long order_id, String status, String payment_status) {}

    public record CreatedOrderResponse(Long order_id) {}

    // ── Admin ────────────────────────────────────────────────────────────────

    public record AdminProductVariantRequest(String size, String color, BigDecimal price, Integer initial_stock) {}

    public record AdminProductUpsertRequest(
            Long collection_id, String sku, String name, String description, String category,
            String subcategory, String fit, String fabric, List<String> images, List<String> regions,
            String initial_location_code, String initial_location_type, String initial_region,
            Integer reorder_threshold, List<AdminProductVariantRequest> variants
    ) {}

    public record InventoryAdjustmentRequest(
            Long product_id, String size, String color, String location_code, String location_type,
            String region, Integer available_quantity, Integer reserved_quantity,
            Integer reorder_threshold, String reason
    ) {}

    public record InventoryRecordResponse(
            Long product_id, String sku, String product_name, String size, String color,
            String location_code, String location_type, String region,
            int available_quantity, int reserved_quantity, int sold_quantity,
            int reorder_threshold, String stock_state
    ) {}

    public record LowStockAlertResponse(
            Long product_id, String sku, String product_name, String size, String color,
            String location_code, String region, int available_quantity,
            int reorder_threshold, int shortfall
    ) {}

    public record AdminDashboardResponse(int active_products, int tracked_variants, int low_stock_alerts, int open_orders) {}

    public record OrderTrackingUpdateRequest(String status, String tracking_status, String note) {}
}
