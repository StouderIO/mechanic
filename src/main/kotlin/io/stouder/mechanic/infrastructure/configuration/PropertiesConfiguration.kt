package io.stouder.mechanic.infrastructure.configuration

import io.stouder.mechanic.infrastructure.configuration.properties.GarageProperties
import io.stouder.mechanic.infrastructure.configuration.properties.MechanicProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@EnableConfigurationProperties(value = [GarageProperties::class, MechanicProperties::class])
class PropertiesConfiguration