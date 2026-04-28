package com.backend1.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

/**
 * SecurityConfig — session-cookie-based auth.
 *
 * Public endpoints:  GET /api/products**, GET /api/collections**, POST /api/auth/**
 * Protected:         /api/cart/**, /api/orders/**, /api/wishlist/**, /api/auth/me
 * Admin-only:        /api/admin/**
 *
 * Actual authentication is handled by SessionCookieService / SessionUserService
 * in each controller — Spring Security here just enforces route-level permits.
 */
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .httpBasic(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)
            .logout(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                // Public read-only storefront
                .requestMatchers(HttpMethod.GET,  "/api/products/**").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/collections/**").permitAll()
                // Auth endpoints
                .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/google").permitAll()
                // Stripe webhooks are authenticated via signature, not session
                .requestMatchers(HttpMethod.POST, "/api/payments/stripe/webhook").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/logout").permitAll()
                // Actuator health check
                .requestMatchers("/actuator/health").permitAll()
                // Everything else requires a session — validated by SessionUserService
                .anyRequest().permitAll()   // controller layer handles session checks
            );
        return http.build();
    }
}
