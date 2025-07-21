package io.stouder.mechanic.domain.ports.inbound.bucket

import io.stouder.mechanic.domain.BucketEntry
import io.stouder.mechanic.domain.BucketId

interface ListFilesUseCase {
    fun listFiles(bucketId: BucketId, prefix: String): List<BucketEntry>
}