# Rebellion Store Backend - Deployment Guide

## Quick Start (5 minutes)

### Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd backend1

# Create .env file
cp .env.example .env
# Edit .env and set JWT_SECRET and other values

# Start all services
docker-compose up --build

# Application will be available at http://localhost:8080
# API Documentation at http://localhost:8080/swagger-ui.html
```

### Local Development

```bash
# 1. Ensure Java 21 and Maven are installed
java -version  # Should be 21+
mvn -v         # Should be 3.9+

# 2. Start MongoDB (using Docker)
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:7.0-alpine

# 3. Set environment variables
export MONGODB_URI="mongodb://admin:password@localhost:27017/rebellion_store?authSource=admin"
export JWT_SECRET="your-secret-key-min-32-chars"
export SPRING_PROFILES_ACTIVE=dev

# 4. Build and run
mvn clean package -DskipTests
java -Dspring.profiles.active=dev -jar target/backend1-1.0.0.jar

# 5. Test the API
curl http://localhost:8080/actuator/health
```

## Production Deployment

### Prerequisites
- Java 21
- MongoDB 5.0+ (managed service recommended)
- Docker (optional but recommended)
- SSL/TLS certificate

### Environment Variables (Required in Production)
```bash
JWT_SECRET=<long-random-string-min-32-chars>
MONGODB_URI=<your-mongodb-uri>
SPRING_PROFILES_ACTIVE=prod
CORS_ALLOWED_ORIGINS=<your-domain>
```

### Standard Deployment

```bash
# 1. Build the application
mvn clean package -P production

# 2. Set up environment
export MONGODB_URI="your-mongo-uri"
export JWT_SECRET="your-secret"
export SPRING_PROFILES_ACTIVE=prod

# 3. Run the JAR
java -jar target/backend1-1.0.0.jar
```

### Docker Deployment

```bash
# 1. Build image
docker build -t rebellion-backend:1.0.0 .

# 2. Run container
docker run -d \
  --name rebellion-backend \
  -p 8080:8080 \
  -e MONGODB_URI="mongodb://user:pass@host:27017/db" \
  -e JWT_SECRET="your-secret" \
  -e SPRING_PROFILES_ACTIVE=prod \
  rebellion-backend:1.0.0

# 3. Verify
curl http://localhost:8080/actuator/health
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rebellion-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: rebellion-backend
  template:
    metadata:
      labels:
        app: rebellion-backend
    spec:
      containers:
      - name: backend
        image: rebellion-backend:1.0.0
        ports:
        - containerPort: 8080
        env:
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: rebellion-secrets
              key: mongodb-uri
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: rebellion-secrets
              key: jwt-secret
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

## HTTPS/TLS Configuration

### Using Self-Signed Certificate
```bash
# Generate keystore
keytool -genkey -alias tomcat -storetype PKCS12 -keyalg RSA -keysize 2048 \
  -keystore keystore.p12 -validity 365

# Configure in application.yml
server:
  ssl:
    key-store: /path/to/keystore.p12
    key-store-password: password
    key-store-type: PKCS12
    key-alias: tomcat
```

### Using Let's Encrypt (Certbot)
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-apache

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Configure in application.yml
server:
  ssl:
    key-store: /etc/letsencrypt/live/your-domain.com/keystore.p12
    key-store-password: ${SSL_KEYSTORE_PASSWORD}
    key-store-type: PKCS12
```

## Performance Tuning

### JVM Arguments
```bash
java -Xmx1g -Xms512m \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -XX:+ParallelRefProcEnabled \
  -Dspring.profiles.active=prod \
  -jar target/backend1-1.0.0.jar
```

### Application Configuration (application-prod.yml)
```yaml
spring:
  data:
    mongodb:
      connection-timeout: 5s
      socket-timeout: 30s
  
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5

server:
  tomcat:
    threads:
      max: 200
      min-spare: 10
    accept-count: 100
    max-connections: 10000
```

## Monitoring & Health Checks

### Health Check Endpoint
```bash
curl -s http://localhost:8080/actuator/health | jq
```

Response:
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP"
    },
    "diskSpace": {
      "status": "UP"
    }
  }
}
```

### Metrics Endpoint
```bash
curl -s http://localhost:8080/actuator/metrics | jq
```

### Enable Prometheus
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
```

Access metrics at: `http://localhost:8080/actuator/prometheus`

## Logging Configuration

### Log Files
- Location: `/var/log/rebellion-store/rebellion-store.log`
- Max size: 10MB per file
- Max history: 30 days
- Total cap: 1GB

### Change Log Level (Runtime)
```bash
# Increase verbosity
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"configuredLevel": "DEBUG"}' \
  http://localhost:8080/actuator/loggers/com.backend1

# Decrease verbosity
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"configuredLevel": "WARN"}' \
  http://localhost:8080/actuator/loggers/com.backend1
```

## Database Backups

### MongoDB Backup
```bash
# Full backup
mongodump \
  --uri="mongodb://admin:password@localhost:27017/rebellion_store" \
  --authenticationDatabase=admin \
  --out=/backups/mongodb/$(date +%Y%m%d)

# Restore from backup
mongorestore \
  --uri="mongodb://admin:password@localhost:27017/rebellion_store" \
  --authenticationDatabase=admin \
  /backups/mongodb/20260101
```

### Automated Backup Script
Create `/usr/local/bin/backup-rebellion-db.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
mongodump \
  --uri="$MONGODB_URI" \
  --authenticationDatabase=admin \
  --out="$BACKUP_DIR/$DATE"

# Keep only last 30 days of backups
find "$BACKUP_DIR" -maxdepth 1 -type d -mtime +30 -exec rm -rf {} \;
```

Add to crontab (run daily at 2 AM):
```bash
0 2 * * * /usr/local/bin/backup-rebellion-db.sh
```

## Troubleshooting

### Application won't start
```bash
# Check Java version
java -version

# Check port availability
lsof -i :8080

# View logs
tail -f logs/rebellion-store.log
```

### MongoDB connection error
```bash
# Test connection
mongosh "mongodb://admin:password@localhost:27017/rebellion_store" --authenticationDatabase admin

# Check MongoDB status
docker logs mongodb
```

### High memory usage
```bash
# Increase JVM heap size
java -Xmx2g -Xms1g -jar target/backend1-1.0.0.jar

# Monitor memory usage
jps -v
```

## Security Checklist

- [ ] Change default MongoDB password
- [ ] Set strong JWT_SECRET (min 32 characters)
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Update CORS allowed origins
- [ ] Enable user authentication
- [ ] Regular security updates
- [ ] Monitor error logs
- [ ] Backup database regularly
- [ ] Use managed database services in production

## Support & Resources

- Documentation: See README.md
- API Docs: http://localhost:8080/swagger-ui.html
- Spring Boot: https://spring.io/projects/spring-boot
- MongoDB: https://docs.mongodb.com/
- Docker: https://docs.docker.com/

---

**Last Updated**: January 2026
