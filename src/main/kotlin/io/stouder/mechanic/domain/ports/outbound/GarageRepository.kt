package io.stouder.mechanic.domain.ports.outbound

import io.stouder.mechanic.domain.*

interface GarageRepository {
    fun getMechanicKeyForBucket(bucketId: BucketId): GarageMechanicKey
    fun getBucketInfo(bucketId: BucketId): BucketInfo
    fun getAdminTokenInfo(adminToken: AdminTokenInfoId): AdminTokenInfo
}