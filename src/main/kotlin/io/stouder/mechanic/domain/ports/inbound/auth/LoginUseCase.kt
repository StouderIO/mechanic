package io.stouder.mechanic.domain.ports.inbound.auth

interface LoginUseCase {
    fun login(adminToken: String)
}