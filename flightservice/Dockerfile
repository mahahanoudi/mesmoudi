# Étape 1 : Construction avec Maven
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copier le pom et les sources
COPY pom.xml .
COPY src ./src

# Construire le jar
RUN mvn clean package -DskipTests

# Étape 2 : Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copier le jar généré
COPY --from=build /app/target/*.jar app.jar

# Exposer le port
EXPOSE 8084

# Lancement
ENTRYPOINT ["java", "-jar", "app.jar"]
