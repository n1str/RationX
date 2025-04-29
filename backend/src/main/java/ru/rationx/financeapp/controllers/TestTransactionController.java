package ru.rationx.financeapp.controllers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/test-transactions")
public class TestTransactionController {

    @GetMapping
    public ResponseEntity<?> getTestTransactions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("GET /api/test-transactions - User: {}", auth.getName());
        
        return ResponseEntity.ok(Map.of(
                "message", "Список тестовых транзакций",
                "user", auth.getName()
        ));
    }

    @PostMapping
    public ResponseEntity<?> createTestTransaction(@RequestBody(required = false) Map<String, Object> payload) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("POST /api/test-transactions - User: {}", auth.getName());
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Тестовая транзакция создана");
        response.put("user", auth.getName());
        
        if (payload != null) {
            response.put("payload", payload);
        }
        
        return ResponseEntity.ok(response);
    }
} 