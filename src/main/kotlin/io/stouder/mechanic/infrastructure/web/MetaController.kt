package io.stouder.mechanic.infrastructure.web

import io.stouder.mechanic.infrastructure.Version
import io.stouder.mechanic.infrastructure.configuration.properties.MechanicProperties
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/meta")
class MetaController(private val mechanicProperties: MechanicProperties) {
    @GetMapping("/info")
    fun getMetaInfo(): ResponseEntity<MetaInfoResponse> {
        return ResponseEntity.ok(
            MetaInfoResponse(
                Version.CURRENT,
                this.mechanicProperties.browse.enable
            )
        )
    }
}

data class MetaInfoResponse(
    val version: String,
    val browseEnabled: Boolean,
)