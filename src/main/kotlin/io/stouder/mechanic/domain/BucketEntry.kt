package io.stouder.mechanic.domain

import java.time.Instant

enum class BucketEntryType {
    FILE,
    FOLDER
}

sealed class BucketEntry(val type: BucketEntryType) {
    data class BucketEntryFile(val path: String, val size: Long, val lastModified: Instant): BucketEntry(BucketEntryType.FILE)
    data class BucketEntryFolder(val path: String): BucketEntry(BucketEntryType.FOLDER)
}