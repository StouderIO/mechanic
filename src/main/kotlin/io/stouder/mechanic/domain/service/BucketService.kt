package io.stouder.mechanic.domain.service

import io.stouder.mechanic.domain.ddd.DomainService
import io.stouder.mechanic.domain.BucketEntry
import io.stouder.mechanic.domain.BucketId
import io.stouder.mechanic.domain.ports.inbound.bucket.DeleteFileUseCase
import io.stouder.mechanic.domain.ports.inbound.bucket.GetFileUseCase
import io.stouder.mechanic.domain.ports.inbound.bucket.ListFilesUseCase
import io.stouder.mechanic.domain.ports.inbound.bucket.UploadFileUseCase
import io.stouder.mechanic.domain.ports.outbound.BrowseRepository
import io.stouder.mechanic.infrastructure.exception.NotFoundException

@DomainService
class BucketService(private val browseRepository: BrowseRepository) : ListFilesUseCase, GetFileUseCase, DeleteFileUseCase, UploadFileUseCase {
    override fun listFiles(bucketId: BucketId, prefix: String): List<BucketEntry> {
        return this.browseRepository.listFiles(bucketId, prefix)
    }

    override fun getFile(bucketId: BucketId, path: String): ByteArray {
        return this.browseRepository.getFile(bucketId, path) ?: throw NotFoundException("File not found: $path")
    }

    override fun deleteFile(bucketId: BucketId, path: String) {
        return this.browseRepository.deleteFile(bucketId, path)
    }

    override fun uploadFile(bucketId: BucketId, path: String, content: ByteArray) {
        return this.browseRepository.uploadFile(bucketId, path, content)
    }
}