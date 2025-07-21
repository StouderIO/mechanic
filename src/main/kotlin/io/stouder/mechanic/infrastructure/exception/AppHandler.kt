package io.stouder.mechanic.infrastructure.exception

import io.stouder.mechanic.domain.exception.DomainException
import org.springframework.http.ProblemDetail
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler

@ControllerAdvice
class AppHandler {
    @ExceptionHandler(DomainException::class)
    fun domainException(exception: DomainException): ProblemDetail =
        ProblemDetail.forStatusAndDetail(exception.code(), exception.message())
}