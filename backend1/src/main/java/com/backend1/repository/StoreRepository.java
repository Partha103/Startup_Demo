package com.backend1.repository;

import com.backend1.dto.ApiModels.AddToCartRequest;
import com.backend1.dto.ApiModels.AuthRequest;
import com.backend1.dto.ApiModels.AuthResponse;
import com.backend1.dto.ApiModels.AuthSessionResponse;
import com.backend1.dto.ApiModels.GoogleAuthRequest;
import com.backend1.dto.ApiModels.CartItemResponse;
import com.backend1.dto.ApiModels.UserResponse;
import com.backend1.dto.ApiModels.WishlistItemResponse;
import com.backend1.model.MongoDocuments.CartItemDocument;
import com.backend1.model.MongoDocuments.ProductDocument;
import com.backend1.model.MongoDocuments.ProductVariantDocument;
import com.backend1.model.MongoDocuments.SessionDocument;
import com.backend1.model.MongoDocuments.UserDocument;
import com.backend1.model.MongoDocuments.WishlistItemDocument;
import com.backend1.security.ApiException;
import com.backend1.security.CredentialHashService;
import com.backend1.service.InventoryService;
import com.backend1.service.MongoSequenceService;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Repository
public class StoreRepository {
    private final MongoTemplate mongoTemplate;
    private final MongoSequenceService sequenceService;
    private final InventoryService inventoryService;
    private final CredentialHashService credentialHashService;

    public StoreRepository(MongoTemplate mongoTemplate, MongoSequenceService sequenceService,
                           InventoryService inventoryService, CredentialHashService credentialHashService) {
        this.mongoTemplate = mongoTemplate;
        this.sequenceService = sequenceService;
        this.inventoryService = inventoryService;
        this.credentialHashService = credentialHashService;
    }

    public AuthResponse register(AuthRequest request) {
        String name = requireText(request.name(), "Name");
        String email = normalizeEmail(request.email());
        String password = requireText(request.password(), "Password");

        if (findUserByEmail(email).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists");
        }

        UserDocument user = new UserDocument(
                sequenceService.nextId("users"),
                name,
                email,
                credentialHashService.hash(password),
                List.of("CUSTOMER"),
                "GLOBAL",
                LocalDateTime.now()
        );
        mongoTemplate.save(user);

        String sessionToken = createSession(user.getId(), null);
        return new AuthResponse(sessionToken, toUserResponse(user));
    }

    public AuthResponse login(AuthRequest request) {
        String email = normalizeEmail(request.email());
        String password = requireText(request.password(), "Password");

        UserDocument user = findUserByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        if (!Objects.equals(user.getPasswordHash(), credentialHashService.hash(password))) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        String sessionToken = createSession(user.getId(), null);
        return new AuthResponse(sessionToken, toUserResponse(user));
    }

    public AuthSessionResponse authenticateExternalSession(String externalSessionId) {
        String email = "google+" + credentialHashService.shortHash(externalSessionId) + "@tanta.style";
        UserDocument user = findUserByEmail(email).orElseGet(() -> {
            UserDocument created = new UserDocument(
                    sequenceService.nextId("users"),
                    "Google User",
                    email,
                    credentialHashService.hash(UUID.randomUUID().toString()),
                    List.of("CUSTOMER"),
                    "GLOBAL",
                    LocalDateTime.now()
            );
            mongoTemplate.save(created);
            return created;
        });

        String sessionToken = createSession(user.getId(), externalSessionId);
        return new AuthSessionResponse(
                sessionToken,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRoles(),
                user.getRegion()
        );
    }


    /**
     * Authenticate via Google OAuth2 access_token.
     * Calls the Google UserInfo endpoint to get name/email, then
     * finds or creates a TANTA user account, and issues a session.
     */
    public AuthResponse authenticateWithGoogleToken(String accessToken) {
        // Fetch Google profile
        String email;
        String name;
        try {
            java.net.URL url = new java.net.URL("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + accessToken);
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            int status = conn.getResponseCode();
            if (status != 200) {
                throw new ApiException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Invalid Google access token");
            }
            try (java.io.InputStream is = conn.getInputStream()) {
                String json = new String(is.readAllBytes());
                // Simple JSON parsing without extra libs
                email = extractJsonField(json, "email");
                name  = extractJsonField(json, "name");
                if (email == null || email.isBlank()) {
                    throw new ApiException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Google token missing email scope");
                }
                if (name == null || name.isBlank()) {
                    name = email.split("@")[0];
                }
            }
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ApiException(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to verify Google token: " + ex.getMessage());
        }

        final String finalEmail = email.toLowerCase().trim();
        final String finalName  = name;

        UserDocument user = findUserByEmail(finalEmail).orElseGet(() -> {
            UserDocument created = new UserDocument(
                    sequenceService.nextId("users"),
                    finalName,
                    finalEmail,
                    credentialHashService.hash(UUID.randomUUID().toString()),
                    List.of("CUSTOMER"),
                    "GLOBAL",
                    LocalDateTime.now()
            );
            mongoTemplate.save(created);
            return created;
        });

        // Update name if changed
        if (!finalName.equals(user.getName())) {
            user.setName(finalName);
            mongoTemplate.save(user);
        }

        String sessionToken = createSession(user.getId(), null);
        return new AuthResponse(sessionToken, toUserResponse(user));
    }

    /** Minimal JSON field extractor — no external lib needed for simple flat objects */
    private static String extractJsonField(String json, String field) {
        String search = "\"" + field + "\"\s*:\s*\"";
        java.util.regex.Matcher m = java.util.regex.Pattern.compile(search + "([^\"]*)\"").matcher(json);
        return m.find() ? m.group(1) : null;
    }

    public Optional<UserResponse> findUserBySessionToken(String sessionToken) {
        return findUserDocumentBySessionToken(sessionToken).map(this::toUserResponse);
    }

    public Optional<UserDocument> findUserDocumentBySessionToken(String sessionToken) {
        if (!StringUtils.hasText(sessionToken)) {
            return Optional.empty();
        }
        SessionDocument session = mongoTemplate.findById(sessionToken, SessionDocument.class);
        if (session == null || session.getExpiresAt() == null || session.getExpiresAt().isBefore(LocalDateTime.now())) {
            return Optional.empty();
        }
        return Optional.ofNullable(mongoTemplate.findById(session.getUserId(), UserDocument.class));
    }

    public void logout(String sessionToken) {
        mongoTemplate.remove(Query.query(Criteria.where("_id").is(sessionToken)), SessionDocument.class);
    }

    public List<CartItemResponse> findCartItems(long userId) {
        Query query = Query.query(Criteria.where("userId").is(userId))
                .with(Sort.by(Sort.Direction.DESC, "createdAt", "_id"));
        return mongoTemplate.find(query, CartItemDocument.class).stream()
                .map(item -> new CartItemResponse(
                        item.getId(),
                        item.getProductId(),
                        item.getSize(),
                        item.getColor(),
                        item.getQuantity(),
                        inventoryService.availableToSell(item.getProductId(), item.getSize(), item.getColor())
                ))
                .toList();
    }

    public void addToCart(long userId, AddToCartRequest request) {
        ProductDocument product = findActiveProductOrThrow(requireId(request.product_id(), "Product"));
        String size = requireText(request.size(), "Size");
        String color = requireText(request.color(), "Color");
        int quantity = request.quantity() == null ? 1 : request.quantity();
        if (quantity < 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Quantity must be at least 1");
        }

        requireVariant(product, size, color);
        inventoryService.assertVariantAvailable(product.getId(), size, color, quantity);

        Query query = Query.query(new Criteria().andOperator(
                Criteria.where("userId").is(userId),
                Criteria.where("productId").is(product.getId()),
                Criteria.where("size").is(size),
                Criteria.where("color").is(color)
        ));
        CartItemDocument existing = mongoTemplate.findOne(query, CartItemDocument.class);
        if (existing != null) {
            int updatedQuantity = existing.getQuantity() + quantity;
            inventoryService.assertVariantAvailable(product.getId(), size, color, updatedQuantity);
            existing.setQuantity(updatedQuantity);
            existing.setUpdatedAt(LocalDateTime.now());
            mongoTemplate.save(existing);
            return;
        }

        mongoTemplate.save(new CartItemDocument(
                sequenceService.nextId("cart_items"),
                userId,
                product.getId(),
                size,
                color,
                quantity,
                LocalDateTime.now(),
                LocalDateTime.now()
        ));
    }

    public void updateCartQuantity(long userId, long cartItemId, int quantity) {
        if (quantity < 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Quantity must be at least 1");
        }

        CartItemDocument cartItem = mongoTemplate.findOne(
                Query.query(new Criteria().andOperator(
                        Criteria.where("_id").is(cartItemId),
                        Criteria.where("userId").is(userId)
                )),
                CartItemDocument.class
        );
        if (cartItem == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Cart item not found");
        }

        inventoryService.assertVariantAvailable(cartItem.getProductId(), cartItem.getSize(), cartItem.getColor(), quantity);
        cartItem.setQuantity(quantity);
        cartItem.setUpdatedAt(LocalDateTime.now());
        mongoTemplate.save(cartItem);
    }

    public void deleteCartItem(long userId, long cartItemId) {
        CartItemDocument cartItem = mongoTemplate.findOne(
                Query.query(new Criteria().andOperator(
                        Criteria.where("_id").is(cartItemId),
                        Criteria.where("userId").is(userId)
                )),
                CartItemDocument.class
        );
        if (cartItem == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Cart item not found");
        }
        mongoTemplate.remove(cartItem);
    }

    public List<WishlistItemResponse> findWishlist(long userId) {
        Query query = Query.query(Criteria.where("userId").is(userId))
                .with(Sort.by(Sort.Direction.DESC, "createdAt", "_id"));
        return mongoTemplate.find(query, WishlistItemDocument.class).stream()
                .map(item -> new WishlistItemResponse(item.getId(), item.getProductId()))
                .toList();
    }

    public void addToWishlist(long userId, long productId) {
        findActiveProductOrThrow(productId);
        Query query = Query.query(new Criteria().andOperator(
                Criteria.where("userId").is(userId),
                Criteria.where("productId").is(productId)
        ));
        WishlistItemDocument existing = mongoTemplate.findOne(query, WishlistItemDocument.class);
        if (existing != null) {
            throw new ApiException(HttpStatus.CONFLICT, "Product already in wishlist");
        }

        mongoTemplate.save(new WishlistItemDocument(
                sequenceService.nextId("wishlist_items"),
                userId,
                productId,
                LocalDateTime.now()
        ));
    }

    public void deleteFromWishlist(long userId, long productId) {
        Query query = Query.query(new Criteria().andOperator(
                Criteria.where("userId").is(userId),
                Criteria.where("productId").is(productId)
        ));
        WishlistItemDocument existing = mongoTemplate.findOne(query, WishlistItemDocument.class);
        if (existing != null) {
            mongoTemplate.remove(existing);
        }
    }

    private ProductDocument findActiveProductOrThrow(long productId) {
        ProductDocument product = mongoTemplate.findById(productId, ProductDocument.class);
        if (product == null || !"ACTIVE".equalsIgnoreCase(product.getStatus())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Product not found");
        }
        return product;
    }

    private ProductVariantDocument requireVariant(ProductDocument product, String size, String color) {
        return product.getVariants().stream()
                .filter(variant -> Objects.equals(variant.getSize(), size) && Objects.equals(variant.getColor(), color))
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Selected variant is not available"));
    }

    private Optional<UserDocument> findUserByEmail(String email) {
        return Optional.ofNullable(mongoTemplate.findOne(
                Query.query(Criteria.where("email").is(email)),
                UserDocument.class
        ));
    }

    private UserResponse toUserResponse(UserDocument user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRoles() == null ? List.of() : List.copyOf(user.getRoles()),
                user.getRegion()
        );
    }

    private String createSession(long userId, String externalSessionId) {
        String sessionToken = UUID.randomUUID().toString();
        mongoTemplate.save(new SessionDocument(
                sessionToken,
                userId,
                trimToNull(externalSessionId),
                LocalDateTime.now(),
                LocalDateTime.now().plusDays(7)
        ));
        return sessionToken;
    }

    private String normalizeEmail(String email) {
        return requireText(email, "Email").toLowerCase(Locale.ROOT);
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
}
