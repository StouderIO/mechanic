package io.stouder.mechanic.domain.ports.inbound.bucket

import io.stouder.mechanic.domain.BucketId

interface GetFileUseCase {
    fun getFile(bucketId: BucketId, path: String): ByteArray
}