package io.stouder.mechanic

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class MechanicApplication

fun main(args: Array<String>) {
    runApplication<MechanicApplication>(*args)
}
