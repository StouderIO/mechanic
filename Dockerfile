FROM docker.io/eclipse-temurin:21-jdk-noble AS build

WORKDIR /app

COPY gradlew build.gradle.kts settings.gradle.kts ./
COPY gradle gradle
COPY src src
COPY frontend frontend

RUN ./gradlew --no-daemon dependencies && \
    ./gradlew --no-daemon bootJar && \
    find /app/build/libs -name "mechanic-*.jar" ! -name "*-plain.jar" -exec cp {} /app/build/libs/mechanic.jar \;

RUN $JAVA_HOME/bin/jlink \
         --add-modules jdk.unsupported,java.base,java.desktop,java.management,java.logging,java.naming,java.security.jgss,java.instrument,java.sql\
         --strip-debug \
         --no-man-pages \
         --no-header-files \
         --compress=2 \
         --output /javaruntime

FROM docker.io/debian:bookworm-slim

WORKDIR /opt/app

ENV JAVA_HOME=/opt/java/openjdk
ENV PATH "${JAVA_HOME}/bin:${PATH}"
COPY --from=build /javaruntime $JAVA_HOME

RUN addgroup --system spring && \
    adduser --system --ingroup spring spring

COPY --from=build --chown=spring:spring /app/build/libs/mechanic.jar app.jar

EXPOSE 8080

USER spring:spring

ENTRYPOINT ["java", "-jar", "app.jar"]