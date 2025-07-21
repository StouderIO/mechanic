package io.stouder.mechanic.infrastructure.web

import io.github.oshai.kotlinlogging.KotlinLogging
import io.stouder.mechanic.domain.service.AuthService
import io.stouder.mechanic.infrastructure.configuration.properties.GarageProperties
import io.swagger.v3.oas.annotations.Hidden
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpSession
import org.springframework.http.*
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.client.HttpClientErrorException
import org.springframework.web.client.HttpServerErrorException
import org.springframework.web.client.RestClientException
import org.springframework.web.client.RestTemplate
import org.springframework.web.util.UriComponentsBuilder

private val logger = KotlinLogging.logger {}

@Hidden
@RestController
@RequestMapping("/proxy")
class ProxyController(
    private val garageProperties: GarageProperties,
    private val authService: AuthService,
) {
    private val restTemplate = RestTemplate()
    @RequestMapping("/**")
    fun proxyRequest(
        session: HttpSession,
        request: HttpServletRequest,
        @RequestBody(required = false) body: String?
    ): ResponseEntity<*> {
        val adminToken = this.authService.getCurrentAdminToken()
        return try {
            val path = request.requestURI.replaceFirst("/proxy".toRegex(), "")
            val targetUrl = UriComponentsBuilder
                .fromUriString(this.garageProperties.apiUrl)
                .path(path)
                .apply {
                    if (request.queryString != null) {
                        query(request.queryString)
                    }
                }
                .build()
                .toUriString()

            val method: HttpMethod = HttpMethod.valueOf(request.method)
            val headers = HttpHeaders()
            request
                .headerNames
                .asSequence()
                .forEach { headerName -> headers.add(headerName, request.getHeader(headerName)) }

            headers.addIfAbsent("Authorization", "Bearer $adminToken")

            val entity: HttpEntity<String> = HttpEntity(body, headers)
            val response: ResponseEntity<String> = restTemplate.exchange(targetUrl, method, entity, String::class.java)

            ResponseEntity.status(response.statusCode)
                .headers(response.headers)
                .body(response.body)
        } catch (e: HttpClientErrorException) {
            ResponseEntity
                .status(e.statusCode)
                .headers(e.responseHeaders ?: HttpHeaders())
                .body(e.responseBodyAsString)
        } catch (e: HttpServerErrorException) {
            ResponseEntity
                .status(e.statusCode)
                .headers(e.responseHeaders ?: HttpHeaders())
                .body(e.responseBodyAsString)
        } catch (e: RestClientException) {
            ResponseEntity
                .status(HttpStatus.BAD_GATEWAY)
                .body(mapOf("error" to "Unable to proxy request: ${e.message}"))
        } catch (e: Exception) {
            ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "Internal server error while processing proxy request"))
        }
    }
}