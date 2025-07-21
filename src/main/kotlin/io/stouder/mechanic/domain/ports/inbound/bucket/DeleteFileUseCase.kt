package io.stouder.mechanic.domain.ports.inbound.bucket

import io.stouder.mechanic.domain.BucketId

interface DeleteFileUseCase {
    fun deleteFile(bucketId: BucketId, path: String)
}