package com.backend1.service;

import com.backend1.dto.ApiModels.UserResponse;
import com.backend1.model.MongoDocuments.SessionDocument;
import com.backend1.model.MongoDocuments.UserDocument;
import com.backend1.security.ApiException;
import com.backend1.security.SessionCookieService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SessionUserService {
    private final MongoTemplate mongoTemplate;
    private final SessionCookieService sessionCookieService;

    public SessionUserService(MongoTemplate mongoTemplate, SessionCookieService sessionCookieService) {
        this.mongoTemplate = mongoTemplate;
        this.sessionCookieService = sessionCookieService;
    }

    public UserDocument requireAuthenticatedUser(HttpServletRequest request) {
        String sessionToken = sessionCookieService.extractSessionToken(request);
        if (sessionToken == null || sessionToken.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        SessionDocument session = mongoTemplate.findById(sessionToken, SessionDocument.class);
        if (session == null || session.getExpiresAt() == null || session.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        UserDocument user = mongoTemplate.findById(session.getUserId(), UserDocument.class);
        if (user == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return user;
    }

    public UserDocument requireAdmin(HttpServletRequest request) {
        UserDocument user = requireAuthenticatedUser(request);
        List<String> roles = user.getRoles();
        if (roles == null || roles.stream().noneMatch("ADMIN"::equalsIgnoreCase)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Admin access required");
        }
        return user;
    }

    public UserResponse toUserResponse(UserDocument user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRoles() == null ? List.of() : List.copyOf(user.getRoles()),
                user.getRegion()
        );
    }
}
