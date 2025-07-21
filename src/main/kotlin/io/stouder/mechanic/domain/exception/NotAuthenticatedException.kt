package io.stouder.mechanic.domain.exception

import org.springframework.http.HttpStatus

class NotAuthenticatedException : DomainException() {
    override fun code(): HttpStatus = HttpStatus.FORBIDDEN
    override fun message(): String = "Not authenticated"
}