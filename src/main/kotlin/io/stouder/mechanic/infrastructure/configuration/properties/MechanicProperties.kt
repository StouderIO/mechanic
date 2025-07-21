package io.stouder.mechanic.infrastructure.configuration.properties

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties("mechanic")
data class MechanicProperties(
    val browse: Browse
) {
    data class Browse(
        val enable: Boolean,
    )
}