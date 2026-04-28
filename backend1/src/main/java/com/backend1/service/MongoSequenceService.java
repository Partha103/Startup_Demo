package com.backend1.service;

import com.backend1.model.MongoDocuments.CounterDocument;

import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

@Service
public class MongoSequenceService {
    private final MongoTemplate mongoTemplate;

    public MongoSequenceService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public long nextId(String sequenceName) {
        Query query = Query.query(Criteria.where("_id").is(sequenceName));
        Update update = new Update().inc("value", 1L);
        FindAndModifyOptions options = FindAndModifyOptions.options().returnNew(true).upsert(true);

        CounterDocument counter = mongoTemplate.findAndModify(query, update, options, CounterDocument.class);
        if (counter == null || counter.getValue() == null) {
            return 1L;
        }
        return counter.getValue();
    }

    public void ensureAtLeast(String sequenceName, long minimumValue) {
        CounterDocument current = mongoTemplate.findById(sequenceName, CounterDocument.class);
        if (current == null || current.getValue() == null || current.getValue() < minimumValue) {
            mongoTemplate.save(new CounterDocument(sequenceName, minimumValue));
        }
    }
}
