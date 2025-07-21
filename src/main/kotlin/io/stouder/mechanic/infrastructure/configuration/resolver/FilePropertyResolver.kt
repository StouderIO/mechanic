package io.stouder.mechanic.infrastructure.configuration.resolver

import org.springframework.context.EnvironmentAware
import org.springframework.core.env.Environment
import org.springframework.stereotype.Component
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Paths

@Component
class FilePropertyResolver : EnvironmentAware {
    private var environment: Environment? = null

    override fun setEnvironment(environment: Environment) {
        this.environment = environment
    }

    fun resolveFileProperty(value: String): String? {
        if (value.isBlank()) {
            return null
        }

        return try {
            Files.readString(Paths.get(value)).trim()
        } catch (e: IOException) {
            null
        }
    }

}