package io.stouder.mechanic.domain

import java.time.Instant

data class BucketInfo(
    val id: BucketId,
    val aliases: List<String>,
    val created: Instant
) {
    val identifier get() = aliases.first()
}
