package io.stouder.mechanic.infrastructure.exception

class NotFoundException(private val whatIsNotFound: String) : RuntimeException("$whatIsNotFound was not found")