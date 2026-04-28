package com.backend1.controller;

import com.backend1.dto.ApiModels.*;
import com.backend1.repository.StoreRepository;
import com.backend1.security.ApiException;
import com.backend1.security.SessionCookieService;
import com.backend1.service.OrderService;
import com.backend1.service.ProductService;
import com.backend1.service.SessionUserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class StoreController {
    private final StoreRepository repository;
    private final ProductService productService;
    private final OrderService orderService;
    private final SessionCookieService sessionCookieService;
    private final SessionUserService sessionUserService;

    public StoreController(StoreRepository repository, ProductService productService, OrderService orderService,
                           SessionCookieService sessionCookieService, SessionUserService sessionUserService) {
        this.repository = repository;
        this.productService = productService;
        this.orderService = orderService;
        this.sessionCookieService = sessionCookieService;
        this.sessionUserService = sessionUserService;
    }

    @GetMapping("/collections")
    public List<CollectionResponse> collections() {
        return productService.findCollections();
    }

    @GetMapping("/products")
    public List<ProductResponse> products(
            @RequestParam(required = false) String category,
            @RequestParam(name = "collection_id", required = false) Long collectionId,
            @RequestParam(name = "min_price", required = false) BigDecimal minPrice,
            @RequestParam(name = "max_price", required = false) BigDecimal maxPrice,
            @RequestParam(name = "size", required = false) List<String> sizes,
            @RequestParam(name = "color", required = false) List<String> colors,
            @RequestParam(name = "fit", required = false) List<String> fits
    ) {
        return productService.findProducts(new ProductFilters(
                category,
                collectionId,
                minPrice,
                maxPrice,
                sizes == null ? List.of() : sizes,
                colors == null ? List.of() : colors,
                fits == null ? List.of() : fits
        ));
    }

    @GetMapping("/products/{productId}")
    public ProductResponse product(@PathVariable long productId) {
        return productService.getProductOrThrow(productId);
    }

    @PostMapping("/auth/register")
    public AuthResponse register(
            @RequestBody AuthRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        AuthResponse response = repository.register(request);
        sessionCookieService.writeSessionCookie(httpRequest, httpResponse, response.session_token());
        return response;
    }

    @PostMapping("/auth/login")
    public AuthResponse login(
            @RequestBody AuthRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        AuthResponse response = repository.login(request);
        sessionCookieService.writeSessionCookie(httpRequest, httpResponse, response.session_token());
        return response;
    }

    @GetMapping("/auth/me")
    public UserResponse currentUser(HttpServletRequest request) {
        return sessionUserService.toUserResponse(sessionUserService.requireAuthenticatedUser(request));
    }

    @PostMapping("/auth/logout")
    public Map<String, String> logout(HttpServletRequest request, HttpServletResponse response) {
        String sessionToken = sessionCookieService.extractSessionToken(request);
        if (sessionToken != null && !sessionToken.isBlank()) {
            repository.logout(sessionToken);
        }
        sessionCookieService.clearSessionCookie(request, response);
        return Map.of("message", "Logged out");
    }


    // ── Google OAuth ─────────────────────────────────────────────────────────

    @PostMapping("/auth/google")
    public AuthResponse googleAuth(
            @RequestBody GoogleAuthRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        if (request.access_token() == null || request.access_token().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Missing access_token");
        }
        // Exchange Google access_token for a TANTA session
        AuthResponse response = repository.authenticateWithGoogleToken(request.access_token());
        sessionCookieService.writeSessionCookie(httpRequest, httpResponse, response.session_token());
        return response;
    }

    @GetMapping("/auth/session")
    public AuthSessionResponse exchangeExternalSession(
            @RequestHeader(name = "X-Session-ID", required = false) String externalSessionId,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        if (externalSessionId == null || externalSessionId.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Missing X-Session-ID header");
        }
        AuthSessionResponse response = repository.authenticateExternalSession(externalSessionId.trim());
        sessionCookieService.writeSessionCookie(httpRequest, httpResponse, response.session_token());
        return response;
    }

    @GetMapping("/cart")
    public List<CartItemResponse> cart(HttpServletRequest request) {
        return repository.findCartItems(requireCurrentUser(request).user_id());
    }

    @PostMapping("/cart")
    public ResponseEntity<Map<String, String>> addToCart(
            @RequestBody AddToCartRequest request,
            HttpServletRequest httpRequest
    ) {
        repository.addToCart(requireCurrentUser(httpRequest).user_id(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Added to cart"));
    }

    @PutMapping("/cart/{cartItemId}")
    public Map<String, String> updateCartQuantity(
            @PathVariable long cartItemId,
            @RequestParam int quantity,
            HttpServletRequest request
    ) {
        repository.updateCartQuantity(requireCurrentUser(request).user_id(), cartItemId, quantity);
        return Map.of("message", "Cart updated");
    }

    @DeleteMapping("/cart/{cartItemId}")
    public Map<String, String> deleteCartItem(@PathVariable long cartItemId, HttpServletRequest request) {
        repository.deleteCartItem(requireCurrentUser(request).user_id(), cartItemId);
        return Map.of("message", "Cart item removed");
    }

    @GetMapping("/wishlist")
    public List<WishlistItemResponse> wishlist(HttpServletRequest request) {
        return repository.findWishlist(requireCurrentUser(request).user_id());
    }

    @PostMapping("/wishlist/{productId}")
    public ResponseEntity<Map<String, String>> addToWishlist(@PathVariable long productId,
                                                             HttpServletRequest request) {
        repository.addToWishlist(requireCurrentUser(request).user_id(), productId);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Added to wishlist"));
    }

    @DeleteMapping("/wishlist/{productId}")
    public Map<String, String> deleteFromWishlist(@PathVariable long productId, HttpServletRequest request) {
        repository.deleteFromWishlist(requireCurrentUser(request).user_id(), productId);
        return Map.of("message", "Wishlist item removed");
    }

    @GetMapping("/orders")
    public List<OrderResponse> orders(HttpServletRequest request) {
        return orderService.findOrders(requireCurrentUser(request).user_id());
    }

    @PostMapping("/orders")
    public ResponseEntity<CreatedOrderResponse> createOrder(
            @RequestBody CreateOrderRequest request,
            HttpServletRequest httpRequest
    ) {
        long orderId = orderService.createOrder(requireCurrentUser(httpRequest).user_id(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new CreatedOrderResponse(orderId));
    }

    @PostMapping("/payments/stripe/checkout")
    public CheckoutSessionResponse createCheckoutSession(
            @RequestBody CheckoutRequest request,
            @RequestHeader(name = "origin", required = false) String origin,
            HttpServletRequest httpRequest
    ) {
        return orderService.createCheckoutSession(requireCurrentUser(httpRequest).user_id(), request, origin);
    }

    @GetMapping("/payments/stripe/status/{sessionId}")
    public PaymentStatusResponse paymentStatus(@PathVariable String sessionId, HttpServletRequest request) {
        return orderService.getPaymentStatus(requireCurrentUser(request).user_id(), sessionId);
    }

    private UserResponse requireCurrentUser(HttpServletRequest request) {
        return sessionUserService.toUserResponse(sessionUserService.requireAuthenticatedUser(request));
    }
}
