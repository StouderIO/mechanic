package io.stouder.mechanic.domain

@JvmInline
value class AdminTokenInfoId(private val value: String) {
    fun asString() = value
}