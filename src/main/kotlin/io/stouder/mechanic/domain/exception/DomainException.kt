package io.stouder.mechanic.domain.exception

import org.springframework.http.HttpStatus

abstract class DomainException : RuntimeException() {
    abstract fun code(): HttpStatus
    abstract fun message(): String
}