package io.stouder.mechanic.domain.ports.inbound.auth

interface GetCurrentAdminTokenUseCase {
    fun getCurrentAdminToken(): String?
}