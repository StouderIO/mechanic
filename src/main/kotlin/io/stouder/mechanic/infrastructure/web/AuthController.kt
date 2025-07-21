package io.stouder.mechanic.infrastructure.web

import io.stouder.mechanic.domain.service.AuthService
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
class AuthController(private val authService: AuthService) {
    @PostMapping("/login")
    fun login(@RequestBody @Validated request: LoginRequest) {
        this.authService.login(request.adminToken)
    }

    @PostMapping("/logout")
    fun logout() {
        this.authService.logout()
    }
}

data class LoginRequest(@NotNull @NotBlank val adminToken: String)
