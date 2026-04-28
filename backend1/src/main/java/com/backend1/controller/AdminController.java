package com.backend1.controller;

import com.backend1.dto.ApiModels.AdminDashboardResponse;
import com.backend1.dto.ApiModels.AdminProductUpsertRequest;
import com.backend1.dto.ApiModels.InventoryAdjustmentRequest;
import com.backend1.dto.ApiModels.InventoryRecordResponse;
import com.backend1.dto.ApiModels.LowStockAlertResponse;
import com.backend1.dto.ApiModels.OrderResponse;
import com.backend1.dto.ApiModels.OrderTrackingUpdateRequest;
import com.backend1.dto.ApiModels.ProductResponse;
import com.backend1.model.MongoDocuments.UserDocument;
import com.backend1.service.InventoryService;
import com.backend1.service.OrderService;
import com.backend1.service.ProductService;
import com.backend1.service.SessionUserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final SessionUserService sessionUserService;
    private final ProductService productService;
    private final InventoryService inventoryService;
    private final OrderService orderService;

    public AdminController(SessionUserService sessionUserService, ProductService productService,
                           InventoryService inventoryService, OrderService orderService) {
        this.sessionUserService = sessionUserService;
        this.productService = productService;
        this.inventoryService = inventoryService;
        this.orderService = orderService;
    }

    @GetMapping("/dashboard")
    public AdminDashboardResponse dashboard(HttpServletRequest request) {
        requireAdmin(request);
        return new AdminDashboardResponse(
                productService.countActiveProducts(),
                inventoryService.countTrackedVariants(),
                inventoryService.findLowStockAlerts().size(),
                orderService.countOpenOrders()
        );
    }

    @GetMapping("/products")
    public List<ProductResponse> products(HttpServletRequest request) {
        requireAdmin(request);
        return productService.findAdminProducts();
    }

    @PostMapping("/products")
    public ProductResponse createProduct(@RequestBody AdminProductUpsertRequest request, HttpServletRequest httpRequest) {
        return productService.createProduct(request, requireAdmin(httpRequest));
    }

    @PutMapping("/products/{productId}")
    public ProductResponse updateProduct(@PathVariable long productId, @RequestBody AdminProductUpsertRequest request,
                                         HttpServletRequest httpRequest) {
        return productService.updateProduct(productId, request, requireAdmin(httpRequest));
    }

    @GetMapping("/inventory")
    public List<InventoryRecordResponse> inventory(HttpServletRequest request) {
        requireAdmin(request);
        return inventoryService.findInventoryRecords(false);
    }

    @GetMapping("/inventory/alerts")
    public List<LowStockAlertResponse> alerts(HttpServletRequest request) {
        requireAdmin(request);
        return inventoryService.findLowStockAlerts();
    }

    @PutMapping("/inventory")
    public List<InventoryRecordResponse> adjustInventory(@RequestBody InventoryAdjustmentRequest request,
                                                         HttpServletRequest httpRequest) {
        inventoryService.adjustInventory(request, requireAdmin(httpRequest));
        return inventoryService.findInventoryRecords(false);
    }

    @GetMapping("/orders")
    public List<OrderResponse> orders(HttpServletRequest request) {
        requireAdmin(request);
        return orderService.findAdminOrders();
    }

    @PatchMapping("/orders/{orderId}")
    public OrderResponse updateOrder(@PathVariable long orderId, @RequestBody OrderTrackingUpdateRequest request,
                                     HttpServletRequest httpRequest) {
        return orderService.updateOrderTracking(orderId, request, requireAdmin(httpRequest));
    }

    private UserDocument requireAdmin(HttpServletRequest request) {
        return sessionUserService.requireAdmin(request);
    }
}
