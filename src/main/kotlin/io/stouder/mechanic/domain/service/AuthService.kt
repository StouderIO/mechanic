package io.stouder.mechanic.domain.service

import app.boardano.domain.ddd.DomainService
import io.stouder.mechanic.domain.exception.NotAuthenticatedException
import io.stouder.mechanic.domain.ports.inbound.auth.GetCurrentAdminTokenUseCase
import io.stouder.mechanic.domain.ports.inbound.auth.LoginUseCase
import io.stouder.mechanic.domain.ports.inbound.auth.LogoutUseCase
import io.stouder.mechanic.domain.ports.outbound.AdminTokenRepository

@DomainService
class AuthService(
    private val adminTokenStore: AdminTokenRepository
) : LoginUseCase, LogoutUseCase, GetCurrentAdminTokenUseCase {
    override fun login(adminToken: String) {
        this.adminTokenStore.save(adminToken)
    }

    override fun getCurrentAdminToken(): String {
        return this.adminTokenStore.get() ?: throw NotAuthenticatedException()
    }

    override fun logout() {
        this.adminTokenStore.remove()
    }
}