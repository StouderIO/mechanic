package io.stouder.mechanic.infrastructure.web

import io.swagger.v3.oas.annotations.Hidden
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping

@Hidden
@Controller
class SpaController {
    @RequestMapping(value = ["/{path:[^.]*}"])
    fun redirect(@PathVariable path: String): String {
        return "forward:/index.html"
    }
}