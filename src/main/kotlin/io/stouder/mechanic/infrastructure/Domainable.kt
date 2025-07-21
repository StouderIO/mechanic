package io.stouder.mechanic.infrastructure

interface Domainable<T> {
    fun toDomain(): T
}