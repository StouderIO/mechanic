package io.stouder.mechanic.infrastructure.configuration.properties

import jakarta.validation.constraints.NotBlank
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.validation.annotation.Validated


@ConfigurationProperties("garage")
@Validated
data class GarageProperties(
    @field:NotBlank val apiUrl: String,
    val s3Url: String
)