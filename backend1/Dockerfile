FROM openjdk:21-jdk-slim

WORKDIR /app

# Copy Maven build file and download dependencies first (better caching)
COPY pom.xml .
RUN apt-get update && apt-get install -y maven && \
    mvn dependency:go-offline -B && \
    apt-get remove -y maven && apt-get clean

# Copy application source code
COPY src ./src

# Build application
RUN apt-get update && apt-get install -y maven && \
    mvn clean package -DskipTests && \
    apt-get remove -y maven && apt-get clean

# Extract JAR
RUN jar xf target/backend1-1.0.0.jar

# Create runtime image
FROM openjdk:21-jdk-slim

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && apt-get clean

# Copy application layers from builder
COPY --from=0 /app/BOOT-INF/lib /app/lib
COPY --from=0 /app/META-INF /app/META-INF
COPY --from=0 /app/BOOT-INF/classes /app

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Expose port
EXPOSE 8080

# Run application
ENTRYPOINT ["java", "-cp", ".:/app/lib/*", "com.backend1.App"]
