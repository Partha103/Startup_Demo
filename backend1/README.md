# Rebellion Store Backend - Production-Grade API

A modern, enterprise-ready e-commerce backend API built with Spring Boot 3.5, MongoDB, and JWT authentication.

## Features

### Core Functionality
- **Product Management**: Comprehensive product catalog with filtering and search
- **User Authentication**: JWT-based authentication with secure password hashing using BCrypt
- **Shopping Cart**: Add/remove items, manage quantities
- **Order Management**: Complete order lifecycle management
- **Wishlist**: Save favorite products for later
- **Collections**: Organize products into curated collections

### Production Features
- **API Documentation**: Auto-generated Swagger UI at `/swagger-ui.html`
- **Monitoring**: Spring Boot Actuator with health checks and metrics
- **Validation**: Bean Validation framework for input validation
- **Error Handling**: Comprehensive global exception handling with structured error responses
- **Logging**: SLF4J with configurable log levels per environment
- **Multi-Environment Support**: Dev, test, and production configurations
- **Security**: CORS configuration, password policy enforcement
- **Docker**: Containerized with Docker and Docker Compose
- **Code Quality**: Checkstyle configuration, test coverage tracking with JaCoCo

## Technology Stack

- **Framework**: Spring Boot 3.5.10
- **Java**: 21
- **Database**: MongoDB 7.0
- **ORM/Mapping**: Spring Data MongoDB
- **Authentication**: JWT (Java JWT)
- **Security**: Spring Security, BCrypt for password hashing
- **API Documentation**: Springdoc OpenAPI (Swagger)
- **Testing**: Spring Boot Test, REST Assured
- **Build Tool**: Maven 3.9+
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Java 21 or higher
- Maven 3.9 or higher
- MongoDB 5.0+ (or use Docker Compose)
- Docker & Docker Compose (for containerized setup)

## Installation & Setup

### Option 1: Local Development

#### 1. Clone and Navigate
```bash
cd backend1
```

#### 2. Setup MongoDB
```bash
# If MongoDB is not installed, use Docker to run it
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:7.0-alpine
```

#### 3. Set Environment Variables
```bash
# Linux/macOS
export MONGODB_URI=mongodb://admin:password@localhost:27017/rebellion_store?authSource=admin
export JWT_SECRET=your-very-secure-secret-key-at-least-32-characters-long

# Windows (PowerShell)
$env:MONGODB_URI = "mongodb://admin:password@localhost:27017/rebellion_store?authSource=admin"
$env:JWT_SECRET = "your-very-secure-secret-key-at-least-32-characters-long"
```

#### 4. Build and Run
```bash
# Development profile
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# Or build and run JAR
mvn clean package -DskipTests
java -jar target/backend1-1.0.0.jar

# Run with specific profile
java -Dspring.profiles.active=prod -jar target/backend1-1.0.0.jar
```

The application will start on `http://localhost:8080`

### Option 2: Docker Compose (Recommended)

```bash
# Set environment variables in .env file or export them
export JWT_SECRET=your-very-secure-secret-key
export CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Start all services (MongoDB + Backend)
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
```

## API Documentation

### Swagger UI
Once the application is running, access the interactive API documentation at:
```
http://localhost:8080/swagger-ui.html
```

### API Base URL
```
http://localhost:8080/api
```

### Authentication
Include JWT token in the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

## Key Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout

### Products
- `GET /api/products` - List products with filters
- `GET /api/products/{id}` - Get product details
- `GET /api/collections` - List product collections

### Shopping
- `GET /api/cart` - View cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/{id}` - Update cart item
- `DELETE /api/cart/{id}` - Remove from cart
- `POST /api/orders` - Create order
- `GET /api/orders` - List user orders

### Wishlist
- `GET /api/wishlist` - List wishlist items
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/{id}` - Remove from wishlist

### Monitoring
- `GET /actuator/health` - Health check
- `GET /actuator/metrics` - Application metrics
- `GET /actuator/info` - Application info

## Environment Configuration

### Development (dev)
- Debug logging enabled
- Pretty-printed JSON output
- Fresh database on each run
- CORS allows localhost:3000 and 3001

Configuration file: `application-dev.yml`

### Production (prod)
- Minimal logging (WARN level)
- Optimized for performance
- Persistent database
- External MongoDB URI required
- JWT secret must be set via environment variable

Configuration file: `application-prod.yml`

### Test (test)
- Test-specific MongoDB
- Debug logging
- Isolated environment

Configuration file: `application-test.yml`

## Configuration Properties

### Key Properties
```yaml
# Server
server.port: 8080

# MongoDB
spring.data.mongodb.uri: mongodb://localhost:27017/rebellion_store

# JWT
app.security.jwt.secret: your-secret-key
app.security.jwt.expiration-ms: 604800000 (7 days)

# CORS
app.cors.allowed-origins: http://localhost:3000,http://localhost:3001

# Logging
logging.level.com.backend1: DEBUG
logging.file.name: logs/rebellion-store.log
```

See `application.yml` for the complete configuration.

## Building & Deployment

### Build JAR
```bash
mvn clean package
```
Output: `target/backend1-1.0.0.jar`

### Build Docker Image
```bash
docker build -t rebellion-backend:1.0.0 .
```

### Run Docker Container
```bash
docker run -p 8080:8080 \
  -e MONGODB_URI=mongodb://admin:password@mongo:27017/rebellion_store \
  -e JWT_SECRET=your-secret \
  rebellion-backend:1.0.0
```

### Deploy to Production
The application uses Spring Boot's built-in server and can be deployed to:
- Cloud platforms (AWS, GCP, Azure)
- Kubernetes clusters
- Traditional application servers

Recommended practices:
- Use environment variables for secrets
- Enable HTTPS/TLS
- Use external MongoDB managed service
- Configure proper firewall rules
- Set up monitoring and alerts

## Testing

### Run All Tests
```bash
mvn test
```

### Run Specific Test Class
```bash
mvn test -Dtest=BackendApiTest
```

### Generate Code Coverage Report
```bash
mvn clean test jacoco:report
```
Coverage report: `target/site/jacoco/index.html`

## Project Structure

```
backend1/
├── src/
│   ├── main/
│   │   ├── java/com/backend1/
│   │   │   ├── service/              # Business logic
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── ProductService.java
│   │   │   │   └── UserService.java
│   │   │   ├── repository/            # Data access
│   │   │   │   └── DataRepositories.java
│   │   │   ├── App.java               # Main entry point
│   │   │   ├── AppConfig.java         # Spring configuration
│   │   │   ├── ApiException.java      # Custom exception
│   │   │   ├── ApiExceptionHandler.java # Exception handling
│   │   │   ├── ApiModels.java         # Request/Response objects
│   │   │   ├── MongoDocuments.java    # MongoDB document models
│   │   │   ├── StoreController.java   # REST endpoints
│   │   │   └── ...
│   │   └── resources/
│   │       ├── application.yml        # Default config
│   │       ├── application-dev.yml    # Dev config
│   │       ├── application-prod.yml   # Prod config
│   │       └── application-test.yml   # Test config
│   └── test/                           # Unit/Integration tests
├── Dockerfile                          # Container definition
├── docker-compose.yml                  # Local development setup
├── pom.xml                             # Maven dependencies
└── README.md                           # This file
```

## Security Considerations

### Passwords
- Minimum 8 characters
- Must contain at least one number
- Must contain at least one special character
- Hashed using BCrypt with strength 12

### JWT Tokens
- Default expiration: 7 days
- Signed with HS256 algorithm
- Include in Authorization header: `Bearer <token>`

### Environment Variables
Always use environment variables for sensitive data:
```
JWT_SECRET          - JWT signing secret (required in production)
MONGODB_URI         - MongoDB connection string
CORS_ALLOWED_ORIGINS - Comma-separated allowed origins
```

### CORS
CORS is configured per environment. Update `app.cors.allowed-origins` as needed.

## Monitoring & Logging

### Health Endpoint
```bash
curl http://localhost:8080/actuator/health
```

### Metrics
Access detailed metrics at:
```
http://localhost:8080/actuator/metrics
```

### Application Logs
Logs are written to:
- Console (development)
- `logs/rebellion-store.log` (production)

Configure log level in `application.yml`:
```yaml
logging:
  level:
    com.backend1: DEBUG
    org.springframework: INFO
```

## Performance Optimization Tips

1. **Database Indexing**: Collections and sessions have indexes on frequently queried fields
2. **Connection Pooling**: Configured in MongoDB driver
3. **Caching**: Implement Spring Cache for frequently accessed data
4. **Pagination**: Implement for large result sets
5. **Async Processing**: Use Spring's `@Async` for long-running operations

## Common Issues & Troubleshooting

### MongoDB Connection Error
```
Error: unable to connect to mongodb
```
**Solution**: Ensure MongoDB is running and the URI is correct
```bash
# Test connection
mongosh "mongodb://admin:password@localhost:27017/rebellion_store" --authenticationDatabase admin
```

### JWT Secret Not Set
```
Error: JWT Secret not configured
```
**Solution**: Set environment variable
```bash
export JWT_SECRET=your-secret-key
```

### Port Already in Use
```
Error: Address already in use: 8080
```
**Solution**: Change port in `application.yml` or kill process using port 8080

### CORS Issues
```
Error: Cross-Origin Request Blocked
```
**Solution**: Update `app.cors.allowed-origins` in configuration

## Contributing

When making changes to the codebase:

1. Follow the existing code structure and naming conventions
2. Write unit tests for new features
3. Ensure all tests pass: `mvn test`
4. Check code quality: `mvn checkstyle:check`
5. Update documentation as needed

## Performance Benchmarks

Typical response times (on modern hardware):

- Product listing: < 100ms
- Product details: < 50ms
- User login: < 200ms (with password hashing)
- Order creation: < 300ms
- Cart operations: < 150ms

## License

Proprietary - All Rights Reserved

## Support & Contact

For issues, feature requests, or questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/swagger-ui.html`

---

**Last Updated**: January 2026  
**Version**: 1.0.0  
**Spring Boot Version**: 3.5.10
