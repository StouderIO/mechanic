FROM docker.io/eclipse-temurin:21-jdk-noble AS build

WORKDIR /app

COPY gradlew build.gradle.kts settings.gradle.kts ./
COPY gradle gradle
COPY src src
COPY frontend frontend

RUN ./gradlew --no-daemon dependencies && \
    ./gradlew --no-daemon clean build && \
    find /app/build/libs -name "mechanic-*.jar" ! -name "*-plain.jar" -exec cp {} /app/build/libs/mechanic.jar \;

FROM docker.io/eclipse-temurin:21-jre-noble

WORKDIR /opt/app

RUN addgroup --system spring && \
    adduser --system --ingroup spring spring

COPY --from=build --chown=spring:spring /app/build/libs/mechanic.jar app.jar

EXPOSE 8080

USER spring:spring

ENTRYPOINT ["java", "-jar", "app.jar"]