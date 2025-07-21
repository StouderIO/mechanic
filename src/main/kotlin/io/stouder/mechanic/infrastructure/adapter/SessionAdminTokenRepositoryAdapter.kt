package io.stouder.mechanic.infrastructure.adapter

import io.github.oshai.kotlinlogging.KotlinLogging
import io.stouder.mechanic.domain.ports.outbound.AdminTokenRepository
import jakarta.servlet.http.HttpSession
import org.springframework.stereotype.Component

private val logger = KotlinLogging.logger {}

@Component
class SessionAdminTokenRepositoryAdapter(
    private val httpSession: HttpSession,
) : AdminTokenRepository {
    private val adminTokenKey = "adminToken"

    override fun save(adminToken: String) {
        this.httpSession.setAttribute(adminTokenKey, adminToken)
    }

    override fun get(): String? {
        return this.httpSession.getAttribute(adminTokenKey) as String?
    }

    override fun remove() {
        this.httpSession.removeAttribute(adminTokenKey)
    }
}