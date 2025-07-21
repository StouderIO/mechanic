package io.stouder.mechanic.infrastructure.adapter

import io.stouder.mechanic.domain.BucketEntry
import io.stouder.mechanic.domain.BucketId
import io.stouder.mechanic.domain.GarageMechanicKey
import io.stouder.mechanic.domain.ports.outbound.BrowseRepository
import io.stouder.mechanic.domain.ports.outbound.GarageRepository
import io.stouder.mechanic.infrastructure.configuration.properties.GarageProperties
import org.springframework.stereotype.Component
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response
import java.net.URI

@Component
class S3BrowseRepositoryAdapter(
    val garageRepository: GarageRepository,
    val garageProperties: GarageProperties
) : BrowseRepository {
    override fun listFiles(bucketId: BucketId, path: String?): List<BucketEntry> {
        val key = this.garageRepository.getMechanicKeyForBucket(bucketId)
        val bucketEntries = mutableListOf<BucketEntry>()
        val s3client = this.buildClient(key)

        val bucketInfo = this.garageRepository.getBucketInfo(bucketId)

        var request = ListObjectsV2Request.builder()
            .bucket(bucketInfo.identifier)
            .prefix(path)
            .delimiter("/")
            .build()
        var response: ListObjectsV2Response
        do {
            response = s3client.listObjectsV2(request)
            bucketEntries.addAll(response.contents().map { BucketEntry.BucketEntryFile(it.key(), it.size(), it.lastModified()) })
            bucketEntries.addAll(response.commonPrefixes().map { BucketEntry.BucketEntryFolder(it.prefix()) })
            val token = response.nextContinuationToken()
            request = request.toBuilder()
                .continuationToken(token)
                .build()
        } while (response.isTruncated)
        return bucketEntries
    }

    override fun getFile(bucketId: BucketId, path: String): ByteArray? {
        val key = this.garageRepository.getMechanicKeyForBucket(bucketId)
        val s3client = this.buildClient(key)
        val bucketInfo = this.garageRepository.getBucketInfo(bucketId)

        val request = GetObjectRequest.builder()
            .bucket(bucketInfo.identifier)
            .key(path)
            .build()

        return s3client.getObjectAsBytes(request).asByteArray()
    }

    override fun deleteFile(bucketId: BucketId, path: String) {
        val key = this.garageRepository.getMechanicKeyForBucket(bucketId)
        val s3client = this.buildClient(key)
        val bucketInfo = this.garageRepository.getBucketInfo(bucketId)

        val request = DeleteObjectRequest.builder()
            .bucket(bucketInfo.identifier)
            .key(path)
            .build()

        s3client.deleteObject(request)
    }

    fun buildClient(key: GarageMechanicKey): S3Client = S3Client
        .builder()
        .endpointOverride(URI.create(this.garageProperties.s3Url))
        .region(Region.of("garage"))
        .credentialsProvider(
            StaticCredentialsProvider.create(
                AwsBasicCredentials.create(
                    key.accessKeyId,
                    key.secretAccessKey
                )
            )
        )
        .build()
}