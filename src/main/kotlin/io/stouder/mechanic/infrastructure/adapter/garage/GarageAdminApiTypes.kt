package io.stouder.mechanic.infrastructure.adapter.garage
import io.stouder.mechanic.domain.AdminTokenInfo
import io.stouder.mechanic.domain.AdminTokenInfoId
import io.stouder.mechanic.domain.BucketId
import io.stouder.mechanic.domain.BucketInfo
import io.stouder.mechanic.infrastructure.Domainable
import java.time.Instant

typealias ListKeysResponse = List<ListKeysResponseItem>

data class KeyInfoBucketResponse(
    val id: String,
    val globalAliases: List<String>,
    val localAliases: List<String>,
    val permissions: ApiBucketKeyPerm
)

data class GetKeyInfoResponse(
    val accessKeyId: String,
    val name: String,
    val expired: Boolean,
    val permissions: KeyPerm,
    val buckets: List<KeyInfoBucketResponse>,
    val created: String? = null,
    val expiration: String? = null,
    val secretAccessKey: String? = null
)

data class UpdateKeyRequestBody(
    val allow: KeyPerm? = null,
    val deny: KeyPerm? = null,
    val expiration: String? = null,
    val name: String? = null,
    val neverExpires: Boolean
)

typealias CreateKeyRequest = UpdateKeyRequestBody
typealias CreateKeyResponse = GetKeyInfoResponse

data class ListKeysResponseItem(
    val id: String,
    val name: String,
    val expired: Boolean,
    val created: String? = null,
    val expiration: String? = null
)

data class KeyPerm(val createBucket: Boolean)

data class ApiBucketKeyPerm(val read: Boolean, val write: Boolean, val owner: Boolean)

data class GetBucketInfoKey(
    val accessKeyId: String,
    val bucketLocalAliases: List<String>,
    val name: String,
    val permissions: ApiBucketKeyPerm
)

data class ApiBucketQuotas(val maxObjects: Long? = null, val maxSize: Long? = null)

data class GetBucketInfoWebsiteResponse(val indexDocument: String, val errorDocument: String? = null)

data class GetBucketInfoResponse(
    val bytes: Long,
    val created: String,
    val globalAliases: List<String>,
    val id: String,
    val keys: List<GetBucketInfoKey>,
    val objects: Long,
    val quotas: ApiBucketQuotas,
    val unfinishedMultipartUploadBytes: Long,
    val unfinishedMultipartUploadParts: Long,
    val unfinishedMultipartUploads: Long,
    val unfinishedUploads: Long,
    val websiteAccess: Boolean,
    val websiteConfig: GetBucketInfoWebsiteResponse? = null
): Domainable<BucketInfo> {
    override fun toDomain(): BucketInfo = BucketInfo(
        BucketId(this.id),
        this.globalAliases + keys.flatMap { it.bucketLocalAliases },
        Instant.parse(this.created)
    )
}

data class BucketKeyPermChangeRequest(
    val accessKeyId: String,
    val bucketId: String,
    val permissions: ApiBucketKeyPerm
)

typealias AllowBucketKeyRequest = BucketKeyPermChangeRequest
typealias AllowBucketKeyResponse = GetBucketInfoResponse

data class GetAdminTokenInfoResponse(
    val id: String?,
    val name: String,
    val expired: Boolean,
    val expiration: String?,
    val created: String?,
    val scope: List<String>
): Domainable<AdminTokenInfo> {
    override fun toDomain(): AdminTokenInfo = AdminTokenInfo(
        this.id?.let { AdminTokenInfoId(it) },
        this.name,
        this.expired,
        this.expiration?.let { Instant.parse(it) },
        this.created?.let { Instant.parse(it) },
        this.scope
    )
}