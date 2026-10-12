# ==============================================================================
# Multi-Stage Dockerfile for Veritas Spring Boot 3 Core (Java 21)
# Optimized for Render Cloud Web Services (Memory-capped for 512 MB Free Tier)
# ==============================================================================

# Stage 1: Build Application Artifact
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /build

# 1. Copy Maven Wrapper and POM first to leverage Docker layer caching
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x ./mvnw
RUN ./mvnw dependency:go-offline -B || true

# 2. Copy source code and compile production JAR
COPY src src
RUN ./mvnw clean package -DskipTests -B

# ------------------------------------------------------------------------------
# Stage 2: Minimal Production JRE Runtime
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Run as non-privileged system user for enterprise security
RUN groupadd -r spring && useradd -r -g spring spring
USER spring:spring

# Copy built JAR from builder stage
COPY --from=builder --chown=spring:spring /build/target/veritas-backend-*.jar /app/app.jar

# Render dynamic port and memory guardrails
# Render free tier gives 512 MB RAM. Capping heap to 384 MB prevents OOM kills.
ENV PORT=8080
ENV JAVA_OPTS="-Xms128m -Xmx384m -XX:+UseG1GC -XX:+ExitOnOutOfMemoryError"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT} -jar /app/app.jar"]

