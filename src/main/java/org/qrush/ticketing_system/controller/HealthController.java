package org.qrush.ticketing_system.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    /**
     * Health check endpoint to verify API is running and accessible
     * Useful for diagnosing CORS and connectivity issues
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("message", "QRush API is running");
        return ResponseEntity.ok(response);
    }

    /**
     * Test CORS by returning a simple response
     */
    @GetMapping("/test-cors")
    public ResponseEntity<Map<String, String>> testCors() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "CORS is working correctly!");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }
}
