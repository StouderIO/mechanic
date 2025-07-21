package io.stouder.mechanic.domain

import java.time.Instant

data class AdminTokenInfo(
    val id: AdminTokenInfoId?,
    val name: String,
    val expired: Boolean,
    val expiration: Instant?,
    val created: Instant?,
    val scopes: List<String>
)
