package com.backend1.service;

import com.backend1.dto.ApiModels.AdminProductUpsertRequest;
import com.backend1.dto.ApiModels.InventoryAdjustmentRequest;
import com.backend1.dto.ApiModels.InventoryRecordResponse;
import com.backend1.dto.ApiModels.LowStockAlertResponse;
import com.backend1.dto.ApiModels.ProductVariantResponse;
import com.backend1.model.MongoDocuments.InventoryDocument;
import com.backend1.model.MongoDocuments.OrderDocument;
import com.backend1.model.MongoDocuments.OrderItemDocument;
import com.backend1.model.MongoDocuments.ProductDocument;
import com.backend1.model.MongoDocuments.ProductVariantDocument;
import com.backend1.model.MongoDocuments.UserDocument;
import com.backend1.security.ApiException;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class InventoryService {
    public record ReservedInventory(String locationCode, String locationType, String region) {
    }

    private final MongoTemplate mongoTemplate;
    private final AuditService auditService;

    public InventoryService(MongoTemplate mongoTemplate, AuditService auditService) {
        this.mongoTemplate = mongoTemplate;
        this.auditService = auditService;
    }

    public void seedInitialInventory(ProductDocument product, AdminProductUpsertRequest request) {
        if (!StringUtils.hasText(request.initial_location_code())) {
            return;
        }

        String locationCode = request.initial_location_code().trim().toUpperCase(Locale.ROOT);
        String locationType = normalizeLocationType(request.initial_location_type());
        String region = StringUtils.hasText(request.initial_region())
                ? request.initial_region().trim().toUpperCase(Locale.ROOT)
                : product.getRegions().getFirst();
        int reorderThreshold = request.reorder_threshold() == null ? 5 : Math.max(0, request.reorder_threshold());

        for (int i = 0; i < request.variants().size(); i++) {
            ProductVariantDocument variant = product.getVariants().get(i);
            Integer initialStock = request.variants().get(i).initial_stock();
            if (initialStock == null || initialStock < 0) {
                continue;
            }
            InventoryDocument existing = findInventoryRecord(product.getId(), variant.getSize(), variant.getColor(), locationCode);
            if (existing != null) {
                continue;
            }
            mongoTemplate.save(new InventoryDocument(
                    inventoryId(product.getId(), variant.getSize(), variant.getColor(), locationCode),
                    product.getId(),
                    variant.getSku(),
                    product.getName(),
                    variant.getSize(),
                    variant.getColor(),
                    locationCode,
                    locationType,
                    region,
                    initialStock,
                    0,
                    0,
                    reorderThreshold,
                    LocalDateTime.now()
            ));
        }
    }

    public List<ProductVariantResponse> buildVariantResponses(ProductDocument product) {
        Map<String, List<InventoryDocument>> inventoryByVariant = findInventoryByProduct(product.getId()).stream()
                .collect(Collectors.groupingBy(inv -> variantKey(inv.getSize(), inv.getColor())));

        return product.getVariants().stream()
                .map(variant -> {
                    List<InventoryDocument> records = inventoryByVariant.getOrDefault(
                            variantKey(variant.getSize(), variant.getColor()),
                            List.of()
                    );
                    int available = records.stream().mapToInt(inv -> safeInt(inv.getAvailableQuantity())).sum();
                    int reserved = records.stream().mapToInt(inv -> safeInt(inv.getReservedQuantity())).sum();
                    return new ProductVariantResponse(
                            variant.getSku(),
                            variant.getSize(),
                            variant.getColor(),
                            variant.getPrice(),
                            available,
                            reserved,
                            available > 0
                    );
                })
                .toList();
    }

    public List<InventoryRecordResponse> findInventoryRecords(boolean lowStockOnly) {
        return mongoTemplate.find(new Query().with(Sort.by(Sort.Direction.ASC, "productName", "locationCode")),
                        InventoryDocument.class)
                .stream()
                .filter(inv -> !lowStockOnly || isLowStock(inv))
                .map(this::toInventoryResponse)
                .toList();
    }

    public List<LowStockAlertResponse> findLowStockAlerts() {
        return mongoTemplate.find(new Query().with(Sort.by(Sort.Direction.ASC, "productName", "locationCode")),
                        InventoryDocument.class)
                .stream()
                .filter(this::isLowStock)
                .map(inv -> new LowStockAlertResponse(
                        inv.getProductId(),
                        inv.getSku(),
                        inv.getProductName(),
                        inv.getSize(),
                        inv.getColor(),
                        inv.getLocationCode(),
                        inv.getRegion(),
                        safeInt(inv.getAvailableQuantity()),
                        safeInt(inv.getReorderThreshold()),
                        safeInt(inv.getReorderThreshold()) - safeInt(inv.getAvailableQuantity())
                ))
                .toList();
    }

    public int countTrackedVariants() {
        return (int) mongoTemplate.count(new Query(), InventoryDocument.class);
    }

    public void adjustInventory(InventoryAdjustmentRequest request, UserDocument actor) {
        if (request.product_id() == null || request.product_id() <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Product is required");
        }
        if (!StringUtils.hasText(request.size()) || !StringUtils.hasText(request.color())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Variant size and color are required");
        }
        if (!StringUtils.hasText(request.location_code())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Location code is required");
        }

        ProductDocument product = mongoTemplate.findById(request.product_id(), ProductDocument.class);
        if (product == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Product not found");
        }

        ProductVariantDocument variant = product.getVariants().stream()
                .filter(item -> Objects.equals(item.getSize(), request.size()) && Objects.equals(item.getColor(), request.color()))
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Unknown product variant"));

        String locationCode = request.location_code().trim().toUpperCase(Locale.ROOT);
        InventoryDocument inventory = findInventoryRecord(product.getId(), request.size(), request.color(), locationCode);
        if (inventory == null) {
            inventory = new InventoryDocument(
                    inventoryId(product.getId(), request.size(), request.color(), locationCode),
                    product.getId(),
                    variant.getSku(),
                    product.getName(),
                    request.size(),
                    request.color(),
                    locationCode,
                    normalizeLocationType(request.location_type()),
                    StringUtils.hasText(request.region()) ? request.region().trim().toUpperCase(Locale.ROOT) : "GLOBAL",
                    0,
                    0,
                    0,
                    5,
                    LocalDateTime.now()
            );
        }

        if (request.available_quantity() != null) {
            if (request.available_quantity() < 0) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Available quantity cannot be negative");
            }
            inventory.setAvailableQuantity(request.available_quantity());
        }
        if (request.reserved_quantity() != null) {
            if (request.reserved_quantity() < 0) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Reserved quantity cannot be negative");
            }
            inventory.setReservedQuantity(request.reserved_quantity());
        }
        if (request.reorder_threshold() != null) {
            inventory.setReorderThreshold(Math.max(0, request.reorder_threshold()));
        }
        if (StringUtils.hasText(request.location_type())) {
            inventory.setLocationType(normalizeLocationType(request.location_type()));
        }
        if (StringUtils.hasText(request.region())) {
            inventory.setRegion(request.region().trim().toUpperCase(Locale.ROOT));
        }
        inventory.setUpdatedAt(LocalDateTime.now());
        mongoTemplate.save(inventory);
        auditService.log(
                actor.getEmail(),
                "INVENTORY_ADJUSTED",
                "inventory",
                inventory.getId(),
                request.reason() == null ? "Manual stock adjustment" : request.reason().trim()
        );
    }

    public int availableToSell(long productId, String size, String color) {
        return findInventoryByVariant(productId, size, color).stream()
                .mapToInt(inv -> safeInt(inv.getAvailableQuantity()))
                .sum();
    }

    public void assertVariantAvailable(long productId, String size, String color, int quantity) {
        if (availableToSell(productId, size, color) < quantity) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Insufficient stock for selected variant");
        }
    }

    public ReservedInventory reserveVariant(ProductDocument product, String size, String color, int quantity) {
        List<InventoryDocument> candidates = findInventoryByVariant(product.getId(), size, color).stream()
                .filter(inv -> safeInt(inv.getAvailableQuantity()) >= quantity)
                .sorted(Comparator
                        .comparingInt((InventoryDocument inv) -> safeInt(inv.getAvailableQuantity())).reversed()
                        .thenComparing(inv -> "STORE".equalsIgnoreCase(inv.getLocationType()) ? 0 : 1)
                        .thenComparing(InventoryDocument::getLocationCode))
                .toList();

        if (candidates.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Insufficient stock for selected variant");
        }

        InventoryDocument selected = candidates.getFirst();
        selected.setAvailableQuantity(safeInt(selected.getAvailableQuantity()) - quantity);
        selected.setReservedQuantity(safeInt(selected.getReservedQuantity()) + quantity);
        selected.setUpdatedAt(LocalDateTime.now());
        mongoTemplate.save(selected);

        return new ReservedInventory(selected.getLocationCode(), selected.getLocationType(), selected.getRegion());
    }

    public void releaseOrderReservations(OrderDocument order) {
        for (OrderItemDocument item : order.getItems()) {
            InventoryDocument inventory = findInventoryRecord(
                    item.getProductId(),
                    item.getSize(),
                    item.getColor(),
                    item.getSourceLocation()
            );
            if (inventory == null) {
                continue;
            }
            inventory.setReservedQuantity(Math.max(0, safeInt(inventory.getReservedQuantity()) - item.getQuantity()));
            inventory.setAvailableQuantity(safeInt(inventory.getAvailableQuantity()) + item.getQuantity());
            inventory.setUpdatedAt(LocalDateTime.now());
            mongoTemplate.save(inventory);
        }
    }

    public void commitOrderReservations(OrderDocument order) {
        for (OrderItemDocument item : order.getItems()) {
            InventoryDocument inventory = findInventoryRecord(
                    item.getProductId(),
                    item.getSize(),
                    item.getColor(),
                    item.getSourceLocation()
            );
            if (inventory == null) {
                continue;
            }
            inventory.setReservedQuantity(Math.max(0, safeInt(inventory.getReservedQuantity()) - item.getQuantity()));
            inventory.setSoldQuantity(safeInt(inventory.getSoldQuantity()) + item.getQuantity());
            inventory.setUpdatedAt(LocalDateTime.now());
            mongoTemplate.save(inventory);
        }
    }

    public List<InventoryDocument> findInventoryByProduct(long productId) {
        return mongoTemplate.find(Query.query(Criteria.where("productId").is(productId)), InventoryDocument.class);
    }

    private List<InventoryDocument> findInventoryByVariant(long productId, String size, String color) {
        return mongoTemplate.find(Query.query(new Criteria().andOperator(
                Criteria.where("productId").is(productId),
                Criteria.where("size").is(size),
                Criteria.where("color").is(color)
        )), InventoryDocument.class);
    }

    private InventoryDocument findInventoryRecord(long productId, String size, String color, String locationCode) {
        return mongoTemplate.findOne(Query.query(new Criteria().andOperator(
                Criteria.where("productId").is(productId),
                Criteria.where("size").is(size),
                Criteria.where("color").is(color),
                Criteria.where("locationCode").is(locationCode)
        )), InventoryDocument.class);
    }

    private InventoryRecordResponse toInventoryResponse(InventoryDocument inventory) {
        return new InventoryRecordResponse(
                inventory.getProductId(),
                inventory.getSku(),
                inventory.getProductName(),
                inventory.getSize(),
                inventory.getColor(),
                inventory.getLocationCode(),
                inventory.getLocationType(),
                inventory.getRegion(),
                safeInt(inventory.getAvailableQuantity()),
                safeInt(inventory.getReservedQuantity()),
                safeInt(inventory.getSoldQuantity()),
                safeInt(inventory.getReorderThreshold()),
                stockState(inventory)
        );
    }

    private boolean isLowStock(InventoryDocument inventory) {
        return safeInt(inventory.getAvailableQuantity()) <= safeInt(inventory.getReorderThreshold());
    }

    private String stockState(InventoryDocument inventory) {
        int available = safeInt(inventory.getAvailableQuantity());
        if (available <= 0) {
            return "out_of_stock";
        }
        if (available <= safeInt(inventory.getReorderThreshold())) {
            return "low_stock";
        }
        if (safeInt(inventory.getReservedQuantity()) > 0) {
            return "reserved";
        }
        return "healthy";
    }

    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }

    private String inventoryId(long productId, String size, String color, String locationCode) {
        return productId + ":" + variantKey(size, color) + ":" + locationCode;
    }

    private String variantKey(String size, String color) {
        return size + "|" + color;
    }

    private String normalizeLocationType(String locationType) {
        if (!StringUtils.hasText(locationType)) {
            return "WAREHOUSE";
        }
        String normalized = locationType.trim().toUpperCase(Locale.ROOT);
        if (!List.of("WAREHOUSE", "STORE").contains(normalized)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Location type must be WAREHOUSE or STORE");
        }
        return normalized;
    }
}
