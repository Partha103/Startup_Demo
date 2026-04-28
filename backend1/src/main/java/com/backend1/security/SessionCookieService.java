package com.backend1.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;
import org.springframework.web.util.WebUtils;

import java.time.Duration;

@Service
public class SessionCookieService {
    private static final Duration SESSION_DURATION = Duration.ofDays(7);

    public String extractSessionToken(HttpServletRequest request) {
        var cookie = WebUtils.getCookie(request, "session_token");
        return cookie == null ? null : cookie.getValue();
    }

    public void writeSessionCookie(HttpServletRequest request, HttpServletResponse response, String sessionToken) {
        boolean secure = request.isSecure();
        String sameSite = secure ? "None" : "Lax";
        ResponseCookie cookie = ResponseCookie.from("session_token", sessionToken)
                .path("/")
                .maxAge(SESSION_DURATION)
                .httpOnly(false)
                .secure(secure)
                .sameSite(sameSite)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    public void clearSessionCookie(HttpServletRequest request, HttpServletResponse response) {
        boolean secure = request.isSecure();
        String sameSite = secure ? "None" : "Lax";
        ResponseCookie cookie = ResponseCookie.from("session_token", "")
                .path("/")
                .maxAge(Duration.ZERO)
                .httpOnly(false)
                .secure(secure)
                .sameSite(sameSite)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }
}
