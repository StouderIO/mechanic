package io.stouder.mechanic.domain.ports.inbound.bucket

import io.stouder.mechanic.domain.BucketId

interface UploadFileUseCase {
    fun uploadFile(bucketId: BucketId, path: String, content: ByteArray)
}