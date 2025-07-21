package io.stouder.mechanic.domain.ports.outbound

import io.stouder.mechanic.domain.BucketEntry
import io.stouder.mechanic.domain.BucketId

interface BrowseRepository {
    fun listFiles(bucketId: BucketId, path: String?): List<BucketEntry>
    fun getFile(bucketId: BucketId, path: String): ByteArray?
    fun deleteFile(bucketId: BucketId, path: String)
}