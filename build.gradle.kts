repositories {
    mavenCentral()
}

plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.spring)
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.spring.dependency.management)
    alias(libs.plugins.openapi)
}

group = "io.stouder"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}

dependencies {
    implementation(libs.kotlin.reflect)
    implementation(libs.spring.boot.starter.main)
    implementation(libs.spring.boot.starter.web)
    implementation(libs.spring.boot.starter.actuator)
    implementation(libs.spring.boot.starter.validation)
    implementation(libs.spring.boot.starter.aop)
    implementation(libs.springdoc.openapi.starter.webmvc.api)
    implementation(libs.jackson.module.kotlin)
    implementation(libs.kotlin.logging)
    implementation(platform(libs.awssdk.bom))
    implementation(libs.awssdk.s3)

    annotationProcessor(libs.spring.boot.configuration.processor)
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict")
    }
}

tasks.bootJar {
    dependsOn(":frontend:copyFrontendToApi")
    dependsOn(":generateOpenApiDocs")
}

tasks.clean {
    dependsOn(":frontend:clean")
}

openApi {
    outputDir.set(file("$projectDir/frontend/openapi"))
    outputFileName.set("mechanic.json")
    customBootRun {
        args.set(listOf("--spring.profiles.active=springdoc"))
    }
}

tasks.register("generateVersionClass") {
    val generatedDir = layout.buildDirectory.dir("generated/source/version/main")
    outputs.dir(generatedDir)

    doLast {
        val versionFile = generatedDir.get().file("io/stouder/mechanic/infrastructure/Version.kt").asFile
        versionFile.parentFile.mkdirs()
        versionFile.writeText("""
            package io.stouder.mechanic.infrastructure
            
            object Version {
                const val current = "${project.version}"
            }
        """.trimIndent())
    }
}

sourceSets {
    main {
        java {
            srcDir(tasks.named("generateVersionClass").map { it.outputs.files.singleFile })
        }
    }
}

tasks.compileKotlin {
    dependsOn("generateVersionClass")
}
