package io.stouder.mechanic.infrastructure.adapter

import io.stouder.mechanic.domain.*
import io.stouder.mechanic.domain.ports.outbound.AdminTokenRepository
import io.stouder.mechanic.domain.ports.outbound.GarageRepository
import io.stouder.mechanic.infrastructure.adapter.garage.*
import io.stouder.mechanic.infrastructure.configuration.properties.GarageProperties
import io.stouder.mechanic.infrastructure.exception.MissingMechanicKeyException
import io.stouder.mechanic.infrastructure.exception.NotFoundException
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.client.ClientHttpResponse
import org.springframework.stereotype.Component
import org.springframework.web.client.DefaultResponseErrorHandler
import org.springframework.web.client.RestTemplate
import org.springframework.web.client.postForObject
import org.springframework.web.server.ResponseStatusException
import org.springframework.web.util.UriComponentsBuilder
import java.net.URI

@Component
class GarageRepositoryAdapter(
    private val garageProperties: GarageProperties,
    private val sessionAdminTokenRepository: AdminTokenRepository,
    private val restTemplateBuilder: RestTemplateBuilder
) : GarageRepository {
    val restTemplate: RestTemplate
        get() = restTemplateBuilder
            .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer ${this.sessionAdminTokenRepository.get()}")
            .errorHandler(Proxy401And403ErrorHandler())
            .build()

    override fun getMechanicKeyForBucket(bucketId: BucketId): GarageMechanicKey {
        return this.keyProvider().forBucket(bucketId)
    }

    override fun getBucketInfo(bucketId: BucketId): BucketInfo {
        val getBucketInfoUrl = UriComponentsBuilder
            .fromUriString(this.garageProperties.apiUrl)
            .path("/v2/GetBucketInfo")
            .queryParam("id", bucketId.asString())
            .build()
            .toUriString()
        val bucketInfoResponse = this.restTemplate.getForObject(getBucketInfoUrl, GetBucketInfoResponse::class.java)
        return bucketInfoResponse?.toDomain() ?: throw NotFoundException("bucket info for id $bucketId")
    }

    override fun getAdminTokenInfo(adminToken: AdminTokenInfoId): AdminTokenInfo {
        val getAdminTokenInfoUrl = UriComponentsBuilder
            .fromUriString(this.garageProperties.apiUrl)
            .path("/v2/GetAdminTokenInfo")
            .queryParam("id", adminToken.asString())
            .build()
            .toUriString()
        val adminTokenInfoResponse = this.restTemplate.getForObject(getAdminTokenInfoUrl, GetAdminTokenInfoResponse::class.java)
        return adminTokenInfoResponse?.toDomain() ?: throw NotFoundException("admin token info for id $adminToken")
    }

    fun keyProvider(): GarageKeyProvider {
        val listKeysUrl = UriComponentsBuilder
            .fromUriString(this.garageProperties.apiUrl)
            .path("/v2/ListKeys")
            .build()
            .toUriString()

        val listKeys = restTemplate.exchange(
            listKeysUrl,
            HttpMethod.GET,
            null,
            object : ParameterizedTypeReference<ListKeysResponse>() {}
        ).body ?: emptyList()
        val mechanicKeyId = listKeys.find { it.name == "Mechanic" }?.id ?: run {
            val createMechanicKey = UriComponentsBuilder
                .fromUriString(this.garageProperties.apiUrl)
                .path("/v2/CreateKey")
                .build()
                .toUriString()

            restTemplate.postForObject<CreateKeyResponse>(
                createMechanicKey,
                CreateKeyRequest(
                    KeyPerm(
                        createBucket = true
                    ),
                    null,
                    null,
                    "Mechanic",
                    true
                )
            ).accessKeyId
        }

        val getKeyInfoUrl = UriComponentsBuilder
            .fromUriString(this.garageProperties.apiUrl)
            .path("/v2/GetKeyInfo")
            .queryParam("id", mechanicKeyId)
            .queryParam("showSecretKey", true)
            .build()
            .toUriString()

        val keyInfo = restTemplate.getForObject(getKeyInfoUrl, GetKeyInfoResponse::class.java)
            ?: throw MissingMechanicKeyException()

        if (keyInfo.secretAccessKey.isNullOrBlank()) {
            throw MissingMechanicKeyException()
        }

        return GarageKeyProvider(
            GarageMechanicKey(keyInfo.accessKeyId, keyInfo.secretAccessKey),
            this.garageProperties,
            restTemplate
        )
    }
}


data class GarageKeyProvider(
    val key: GarageMechanicKey,
    val garageProperties: GarageProperties,
    val restTemplate: RestTemplate
) {
    fun forBucket(bucketId: BucketId): GarageMechanicKey {
        val getKeyInfoUrl = UriComponentsBuilder
            .fromUriString(this.garageProperties.apiUrl)
            .path("/v2/GetKeyInfo")
            .queryParam("id", key.accessKeyId)
            .queryParam("showSecretKey", true)
            .build()
            .toUriString()

        val keyInfo = this.restTemplate.getForObject(getKeyInfoUrl, GetKeyInfoResponse::class.java)
            ?: throw MissingMechanicKeyException()


        if (keyInfo.buckets.none { it.id == bucketId.asString() && it.permissions.read && it.permissions.write && it.permissions.owner }) {
            val allowBucketKeyUrl = UriComponentsBuilder
                .fromUriString(this.garageProperties.apiUrl)
                .path("/v2/AllowBucketKey")
                .build()
                .toUriString()

            this.restTemplate.postForObject<AllowBucketKeyResponse>(
                allowBucketKeyUrl,
                AllowBucketKeyRequest(
                    key.accessKeyId,
                    bucketId.asString(),
                    ApiBucketKeyPerm(read = true, write = true, owner = true)
                )
            )
        }

        return key
    }
}

class Proxy401And403ErrorHandler : DefaultResponseErrorHandler() {
    override fun handleError(url: URI, method: HttpMethod, response: ClientHttpResponse) {
        when (response.statusCode) {
            HttpStatus.UNAUTHORIZED -> throw ResponseStatusException(HttpStatus.UNAUTHORIZED, response.statusText)
            HttpStatus.FORBIDDEN -> throw ResponseStatusException(HttpStatus.FORBIDDEN, response.statusText)
            else -> super.handleError(response)
        }
    }
}