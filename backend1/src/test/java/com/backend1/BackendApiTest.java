package com.backend1;

import com.backend1.service.StoreDataInitializer;
import io.restassured.RestAssured;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.context.TestPropertySource;

import java.util.List;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static io.restassured.RestAssured.when;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.startsWith;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
        "spring.data.mongodb.uri=mongodb://localhost:27017/tanta_store_test",
        "spring.data.mongodb.auto-index-creation=true"
})
public class BackendApiTest {
    @Value("${local.server.port}")
    int port;

    @Autowired
    MongoTemplate mongoTemplate;

    @Autowired
    StoreDataInitializer storeDataInitializer;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        mongoTemplate.getDb().drop();
        storeDataInitializer.seedCatalogIfEmpty();
    }

    @Test
    void catalogEndpointsExposeSeededStoreData() {
        when().get("/").then()
                .statusCode(200)
                .body(is("TANTA Fashion API — running"));

        when().get("/api/collections").then()
                .statusCode(200)
                .body("$", hasSize(3));

        given()
                .queryParam("category", "outerwear")
                .when()
                .get("/api/products")
                .then()
                .statusCode(200)
                .body("$", hasSize(2));

        when().get("/api/products/1").then()
                .statusCode(200)
                .body("product_id", is(1))
                .body("name", is("Shadow Bomber"))
                .body("sizes", hasSize(4))
                .body("images", hasSize(2));
    }

    @Test
    void authCartOrderAndPaymentFlowWorksEndToEnd() {
        String sessionToken = given()
                .contentType("application/json")
                .body(Map.of(
                        "name", "Ava Stone",
                        "email", "ava@example.com",
                        "password", "secret123"
                ))
                .when()
                .post("/api/auth/register")
                .then()
                .statusCode(200)
                .body("user.email", is("ava@example.com"))
                .extract()
                .path("session_token");

        given()
                .cookie("session_token", sessionToken)
                .when()
                .get("/api/auth/me")
                .then()
                .statusCode(200)
                .body("name", is("Ava Stone"));

        given()
                .cookie("session_token", sessionToken)
                .contentType("application/json")
                .body(Map.of(
                        "product_id", 1,
                        "size", "M",
                        "color", "Black",
                        "quantity", 2
                ))
                .when()
                .post("/api/cart")
                .then()
                .statusCode(201);

        given()
                .cookie("session_token", sessionToken)
                .when()
                .get("/api/cart")
                .then()
                .statusCode(200)
                .body("$", hasSize(1))
                .body("[0].quantity", is(2));

        Number orderIdNumber = given()
                .cookie("session_token", sessionToken)
                .contentType("application/json")
                .body(Map.of(
                        "items", List.of(Map.of(
                                "product_id", 1,
                                "name", "Shadow Bomber",
                                "quantity", 2,
                                "price", 245.00,
                                "size", "M",
                                "color", "Black"
                        )),
                        "total_amount", 490.00,
                        "shipping_address", Map.of(
                                "name", "Ava Stone",
                                "address", "21 Underground Ave",
                                "city", "Kolkata",
                                "postal_code", "700001",
                                "country", "India"
                        ),
                        "payment_method", "stripe"
                ))
                .when()
                .post("/api/orders")
                .then()
                .statusCode(201)
                .extract()
                .path("order_id");
        long orderId = orderIdNumber.longValue();

        String checkoutSessionId = given()
                .cookie("session_token", sessionToken)
                .header("origin", "http://localhost:3000")
                .contentType("application/json")
                .body(Map.of(
                        "amount", 490.00,
                        "currency", "usd",
                        "order_id", orderId
                ))
                .when()
                .post("/api/payments/stripe/checkout")
                .then()
                .statusCode(200)
                .body("url", startsWith("http://localhost:3000/checkout/success?session_id="))
                .extract()
                .path("session_id");

        given()
                .cookie("session_token", sessionToken)
                .when()
                .get("/api/payments/stripe/status/{sessionId}", checkoutSessionId)
                .then()
                .statusCode(200)
                .body("payment_status", is("paid"))
                .body("status", is("complete"));

        given()
                .cookie("session_token", sessionToken)
                .when()
                .get("/api/orders")
                .then()
                .statusCode(200)
                .body("$", hasSize(1))
                .body("[0].status", is("paid"))
                .body("[0].items", hasSize(1))
                .body("[0].items[0].name", is("Shadow Bomber"));
    }

    @Test
    void adminCanManageProductsInventoryAndOrderTracking() {
        String adminToken = given()
                .contentType("application/json")
                .body(Map.of(
                        "email", "admin@tanta.style",
                        "password", "Admin#123"
                ))
                .when()
                .post("/api/auth/login")
                .then()
                .statusCode(200)
                .body("user.roles", hasSize(2))
                .extract()
                .path("session_token");

        given()
                .cookie("session_token", adminToken)
                .when()
                .get("/api/admin/dashboard")
                .then()
                .statusCode(200)
                .body("active_products", is(6))
                .body("tracked_variants", greaterThan(0));

        Number productIdNumber = given()
                .cookie("session_token", adminToken)
                .contentType("application/json")
                .body(Map.ofEntries(
                        Map.entry("collection_id", 1),
                        Map.entry("sku", "SKU900"),
                        Map.entry("name", "Command Overshirt"),
                        Map.entry("description", "Structured utility overshirt for admin workflow testing."),
                        Map.entry("category", "tops"),
                        Map.entry("subcategory", "shirts"),
                        Map.entry("fit", "regular"),
                        Map.entry("fabric", "Cotton canvas"),
                        Map.entry("images", List.of("https://images.example.com/overshirt.jpg")),
                        Map.entry("regions", List.of("NORTH")),
                        Map.entry("initial_location_code", "DELHI_FC"),
                        Map.entry("initial_location_type", "WAREHOUSE"),
                        Map.entry("initial_region", "NORTH"),
                        Map.entry("reorder_threshold", 2),
                        Map.entry("variants", List.of(Map.of(
                                "size", "M",
                                "color", "Black",
                                "price", 199.00,
                                "initial_stock", 7
                        )))
                ))
                .when()
                .post("/api/admin/products")
                .then()
                .statusCode(200)
                .body("sku", is("SKU900"))
                .body("total_available", is(7))
                .extract()
                .path("product_id");
        long newProductId = productIdNumber.longValue();

        given()
                .cookie("session_token", adminToken)
                .contentType("application/json")
                .body(Map.of(
                        "product_id", newProductId,
                        "size", "M",
                        "color", "Black",
                        "location_code", "DELHI_FC",
                        "location_type", "WAREHOUSE",
                        "region", "NORTH",
                        "available_quantity", 12,
                        "reserved_quantity", 0,
                        "reorder_threshold", 3,
                        "reason", "Stock rebalanced from Mumbai"
                ))
                .when()
                .put("/api/admin/inventory")
                .then()
                .statusCode(200);

        when().get("/api/products/{productId}", newProductId).then()
                .statusCode(200)
                .body("total_available", is(12));

        String customerToken = given()
                .contentType("application/json")
                .body(Map.of(
                        "name", "Mira Chen",
                        "email", "mira@example.com",
                        "password", "secret123"
                ))
                .when()
                .post("/api/auth/register")
                .then()
                .statusCode(200)
                .extract()
                .path("session_token");

        Number orderIdNumber = given()
                .cookie("session_token", customerToken)
                .contentType("application/json")
                .body(Map.of(
                        "items", List.of(Map.of(
                                "product_id", newProductId,
                                "name", "Command Overshirt",
                                "quantity", 1,
                                "price", 199.00,
                                "size", "M",
                                "color", "Black"
                        )),
                        "total_amount", 199.00,
                        "shipping_address", Map.of(
                                "name", "Mira Chen",
                                "address", "42 Control Street",
                                "city", "Delhi",
                                "postal_code", "110001",
                                "country", "India"
                        ),
                        "payment_method", "stripe"
                ))
                .when()
                .post("/api/orders")
                .then()
                .statusCode(201)
                .extract()
                .path("order_id");
        long orderId = orderIdNumber.longValue();

        given()
                .cookie("session_token", adminToken)
                .contentType("application/json")
                .body(Map.of(
                        "status", "fulfilled",
                        "tracking_status", "in_transit",
                        "note", "Packed and handed to courier"
                ))
                .when()
                .patch("/api/admin/orders/{orderId}", orderId)
                .then()
                .statusCode(200)
                .body("status", is("fulfilled"))
                .body("tracking_status", is("in_transit"));
    }
}
