package io.stouder.mechanic.infrastructure.configuration

import io.stouder.mechanic.domain.ddd.DomainService
import io.stouder.mechanic.domain.ddd.Stub
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.FilterType

@Configuration
@ComponentScan(
    basePackages = ["io.stouder.mechanic.domain"],
    includeFilters = [
        ComponentScan.Filter(
            type = FilterType.ANNOTATION,
            value = [DomainService::class, Stub::class]
        )
    ]
)
class DomainConfiguration {
}