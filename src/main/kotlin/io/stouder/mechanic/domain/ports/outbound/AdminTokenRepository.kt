package io.stouder.mechanic.domain.ports.outbound

interface AdminTokenRepository {
    fun save(adminToken: String)
    fun get(): String?
    fun remove()
}