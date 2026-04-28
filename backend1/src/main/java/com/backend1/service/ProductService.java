package com.backend1.service;

import com.backend1.dto.ApiModels.AdminProductUpsertRequest;
import com.backend1.dto.ApiModels.AdminProductVariantRequest;
import com.backend1.dto.ApiModels.CollectionResponse;
import com.backend1.dto.ApiModels.ProductFilters;
import com.backend1.dto.ApiModels.ProductResponse;
import com.backend1.dto.ApiModels.ProductVariantResponse;
import com.backend1.model.MongoDocuments.CatalogCollectionDocument;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ProductService {
    private final MongoTemplate mongoTemplate;
    private final MongoSequenceService sequenceService;
    private final InventoryService inventoryService;
    private final AuditService auditService;

    public ProductService(MongoTemplate mongoTemplate, MongoSequenceService sequenceService,
                          InventoryService inventoryService, AuditService auditService) {
        this.mongoTemplate = mongoTemplate;
        this.sequenceService = sequenceService;
        this.inventoryService = inventoryService;
        this.auditService = auditService;
    }

    public List<CollectionResponse> findCollections() {
        List<CatalogCollectionDocument> collections = mongoTemplate.find(
                new Query().with(Sort.by(Sort.Direction.ASC, "displayOrder", "_id")),
                CatalogCollectionDocument.class
        );
        Map<Long, Long> productCounts = mongoTemplate.find(
                        Query.query(Criteria.where("status").is("ACTIVE")),
                        ProductDocument.class
                ).stream()
                .collect(Collectors.groupingBy(ProductDocument::getCollectionId, Collectors.counting()));

        return collections.stream()
                .map(collection -> new CollectionResponse(
                        collection.getId(),
                        collection.getName(),
                        collection.getDescription(),
                        collection.getImage(),
                        productCounts.getOrDefault(collection.getId(), 0L).intValue()
                ))
                .toList();
    }

    public List<ProductResponse> findProducts(ProductFilters filters) {
        Query query = new Query();
        List<Criteria> criteria = new ArrayList<>();
        criteria.add(Criteria.where("status").is("ACTIVE"));

        if (StringUtils.hasText(filters.category())) {
            criteria.add(Criteria.where("category").is(filters.category().trim().toLowerCase(Locale.ROOT)));
        }
        if (filters.collectionId() != null) {
            criteria.add(Criteria.where("collectionId").is(filters.collectionId()));
        }
        if (filters.minPrice() != null) {
            criteria.add(Criteria.where("price").gte(filters.minPrice()));
        }
        if (filters.maxPrice() != null) {
            criteria.add(Criteria.where("price").lte(filters.maxPrice()));
        }
        if (!filters.fits().isEmpty()) {
            criteria.add(Criteria.where("fit").in(filters.fits().stream()
                    .filter(StringUtils::hasText)
                    .map(value -> value.trim().toLowerCase(Locale.ROOT))
                    .toList()));
        }

        query.addCriteria(new Criteria().andOperator(criteria.toArray(new Criteria[0])));
        query.with(Sort.by(Sort.Direction.ASC, "_id"));

        return mongoTemplate.find(query, ProductDocument.class).stream()
                .map(this::toProductResponse)
                .filter(product -> product.total_available() > 0)
                .filter(product -> filters.sizes().isEmpty() || product.variants().stream()
                        .anyMatch(variant -> filters.sizes().contains(variant.size()) && variant.available()))
                .filter(product -> filters.colors().isEmpty() || product.variants().stream()
                        .anyMatch(variant -> filters.colors().contains(variant.color()) && variant.available()))
                .toList();
    }

    public ProductResponse getProductOrThrow(long productId) {
        ProductDocument product = getActiveProductDocumentOrThrow(productId);
        ProductResponse response = toProductResponse(product);
        if (response.total_available() <= 0) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Product not found");
        }
        return response;
    }

    public ProductDocument getProductDocumentOrThrow(long productId) {
        ProductDocument product = mongoTemplate.findById(productId, ProductDocument.class);
        if (product == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Product not found");
        }
        return product;
    }

    public ProductDocument getActiveProductDocumentOrThrow(long productId) {
        ProductDocument product = getProductDocumentOrThrow(productId);
        if (!"ACTIVE".equalsIgnoreCase(product.getStatus())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Product not found");
        }
        return product;
    }

    public ProductVariantDocument requireVariant(ProductDocument product, String size, String color) {
        return product.getVariants().stream()
                .filter(variant -> Objects.equals(variant.getSize(), size) && Objects.equals(variant.getColor(), color))
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Selected variant is not available"));
    }

    public List<ProductResponse> findAdminProducts() {
        return mongoTemplate.find(new Query().with(Sort.by(Sort.Direction.ASC, "_id")), ProductDocument.class)
                .stream()
                .map(this::toProductResponse)
                .toList();
    }

    public ProductResponse createProduct(AdminProductUpsertRequest request, UserDocument actor) {
        validateProductRequest(request);
        String sku = normalizeSku(request.sku());
        if (mongoTemplate.exists(Query.query(Criteria.where("sku").is(sku)), ProductDocument.class)) {
            throw new ApiException(HttpStatus.CONFLICT, "Product SKU already exists");
        }

        ProductDocument product = buildProductDocument(
                sequenceService.nextId("products"),
                null,
                request,
                sku
        );
        mongoTemplate.save(product);
        inventoryService.seedInitialInventory(product, request);
        auditService.log(actor.getEmail(), "PRODUCT_CREATED", "product", product.getId().toString(), product.getName());
        return toProductResponse(product);
    }

    public ProductResponse updateProduct(long productId, AdminProductUpsertRequest request, UserDocument actor) {
        validateProductRequest(request);
        ProductDocument existing = getProductDocumentOrThrow(productId);
        String sku = normalizeSku(request.sku());

        ProductDocument withSameSku = mongoTemplate.findOne(Query.query(Criteria.where("sku").is(sku)), ProductDocument.class);
        if (withSameSku != null && !Objects.equals(withSameSku.getId(), productId)) {
            throw new ApiException(HttpStatus.CONFLICT, "Product SKU already exists");
        }

        ProductDocument updated = buildProductDocument(productId, existing, request, sku);
        mongoTemplate.save(updated);
        inventoryService.seedInitialInventory(updated, request);
        auditService.log(actor.getEmail(), "PRODUCT_UPDATED", "product", updated.getId().toString(), updated.getName());
        return toProductResponse(updated);
    }

    public int countActiveProducts() {
        return (int) mongoTemplate.count(Query.query(Criteria.where("status").is("ACTIVE")), ProductDocument.class);
    }

    private ProductDocument buildProductDocument(long productId, ProductDocument existing,
                                                 AdminProductUpsertRequest request, String sku) {
        List<ProductVariantDocument> variants = request.variants().stream()
                .map(variant -> new ProductVariantDocument(
                        buildVariantSku(sku, variant),
                        normalizeText(variant.size(), "Variant size"),
                        normalizeText(variant.color(), "Variant color"),
                        requireMoney(variant.price(), "Variant price")
                ))
                .toList();

        LocalDateTime createdAt = existing == null ? LocalDateTime.now() : existing.getCreatedAt();
        BigDecimal basePrice = variants.stream()
                .map(ProductVariantDocument::getPrice)
                .min(Comparator.naturalOrder())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "At least one variant is required"));
        List<String> colors = distinct(variants.stream().map(ProductVariantDocument::getColor).toList());
        List<String> sizes = distinct(variants.stream().map(ProductVariantDocument::getSize).toList());
        List<String> images = request.images() == null ? List.of() : request.images().stream()
                .filter(StringUtils::hasText)
                .map(String::trim)
                .toList();
        if (images.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "At least one image is required");
        }
        List<String> regions = request.regions() == null || request.regions().isEmpty()
                ? List.of("GLOBAL")
                : distinct(request.regions().stream()
                .filter(StringUtils::hasText)
                .map(value -> value.trim().toUpperCase(Locale.ROOT))
                .toList());

        return new ProductDocument(
                productId,
                sku,
                requireId(request.collection_id(), "Collection"),
                normalizeText(request.name(), "Product name"),
                normalizeText(request.description(), "Product description"),
                basePrice,
                normalizeText(request.category(), "Category").toLowerCase(Locale.ROOT),
                normalizeText(request.subcategory(), "Subcategory").toLowerCase(Locale.ROOT),
                trimToNull(request.fit()) == null ? null : request.fit().trim().toLowerCase(Locale.ROOT),
                trimToNull(request.fabric()),
                "ACTIVE",
                colors,
                sizes,
                images,
                regions,
                variants,
                createdAt,
                LocalDateTime.now()
        );
    }

    private void validateProductRequest(AdminProductUpsertRequest request) {
        if (request.variants() == null || request.variants().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "At least one variant is required");
        }
        for (AdminProductVariantRequest variant : request.variants()) {
            normalizeText(variant.size(), "Variant size");
            normalizeText(variant.color(), "Variant color");
            requireMoney(variant.price(), "Variant price");
        }
    }

    private ProductResponse toProductResponse(ProductDocument product) {
        List<ProductVariantResponse> variants = inventoryService.buildVariantResponses(product);
        List<ProductVariantResponse> availableVariants = variants.stream()
                .filter(ProductVariantResponse::available)
                .toList();
        List<String> colors = distinct((availableVariants.isEmpty() ? variants : availableVariants).stream()
                .map(ProductVariantResponse::color)
                .toList());
        List<String> sizes = distinct((availableVariants.isEmpty() ? variants : availableVariants).stream()
                .map(ProductVariantResponse::size)
                .toList());
        int totalAvailable = variants.stream().mapToInt(ProductVariantResponse::available_stock).sum();

        return new ProductResponse(
                product.getId(),
                product.getCollectionId(),
                product.getSku(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getCategory(),
                product.getSubcategory(),
                product.getFit(),
                product.getFabric(),
                product.getStatus(),
                colors,
                sizes,
                product.getImages(),
                product.getRegions() == null ? List.of("GLOBAL") : product.getRegions(),
                totalAvailable,
                variants
        );
    }

    private String buildVariantSku(String baseSku, AdminProductVariantRequest variant) {
        return baseSku + "-" + variant.color().trim().toUpperCase(Locale.ROOT).replace(' ', '_')
                + "-" + variant.size().trim().toUpperCase(Locale.ROOT);
    }

    private List<String> distinct(List<String> values) {
        return new ArrayList<>(new LinkedHashSet<>(values));
    }

    private String normalizeSku(String value) {
        String normalized = normalizeText(value, "SKU").toUpperCase(Locale.ROOT).replace(' ', '-');
        if (!normalized.matches("[A-Z0-9\\-]+")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "SKU may only contain letters, numbers, and hyphens");
        }
        return normalized;
    }

    private String normalizeText(String value, String label) {
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

    private BigDecimal requireMoney(BigDecimal value, String label) {
        if (value == null || value.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, label + " is required");
        }
        return value;
    }
}
