# Build stage
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and package application
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Add a non-root system user for security
RUN addgroup -S robovault && adduser -S robovault -G robovault

COPY --from=build /app/target/robovault-backend-*.jar app.jar

RUN chown -R robovault:robovault /app
USER robovault

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/api/dashboard/summary || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]

