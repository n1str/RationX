package ru.rationx.financeapp.controllers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/public")
    public ResponseEntity<?> publicEndpoint() {
        log.info("Accessing public endpoint");
        return ResponseEntity.ok(Map.of(
                "message", "Этот эндпоинт публичный, не требует аутентификации",
                "authenticated", false
        ));
    }

    @GetMapping("/auth")
    public ResponseEntity<?> authenticatedEndpoint() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("Accessing authenticated endpoint. User: {}", auth.getName());
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Вы успешно аутентифицированы!");
        response.put("authenticated", true);
        response.put("username", auth.getName());
        response.put("authorities", auth.getAuthorities());
        
        return ResponseEntity.ok(response);
    }
} 