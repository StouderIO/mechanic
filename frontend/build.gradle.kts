import com.github.gradle.node.npm.task.NpmTask

repositories {
    mavenCentral()
}

plugins {
    alias(libs.plugins.node)
}

node {
    download = true
    version = "22.16.0"
}

tasks.register<NpmTask>("buildFrontend") {
    dependsOn(tasks.npmInstall)
    npmCommand.set(listOf("run", "build"))
    inputs.dir("src")
    inputs.dir("node_modules")
    inputs.file("package.json")
    inputs.file("vite.config.ts")
    outputs.dir("dist")
}

tasks.register<Copy>("copyFrontendToApi") {
    dependsOn("buildFrontend")
    from("dist")
    into("../src/main/resources/static")
}

tasks.register<Delete>("clean") {
    delete("dist", "node_modules", "build", ".tanstack", "../src/main/resources/static")
}
