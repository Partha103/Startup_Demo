package com.backend1.service;

import com.backend1.model.MongoDocuments.AuditLogDocument;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuditService {
    private final MongoTemplate mongoTemplate;

    public AuditService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public void log(String actorEmail, String action, String targetType, String targetId, String details) {
        mongoTemplate.save(new AuditLogDocument(
                UUID.randomUUID().toString(),
                actorEmail,
                action,
                targetType,
                targetId,
                details,
                LocalDateTime.now()
        ));
    }
}
