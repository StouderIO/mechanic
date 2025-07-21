package io.stouder.mechanic.domain

@JvmInline
value class BucketId(private val value: String) {
    fun asString() = value
}