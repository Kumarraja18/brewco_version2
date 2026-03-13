package com.brewco.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
public class MailDiagnosticController {

    @Value("${resend.api-key:}")
    private String resendApiKey;

    @Value("${resend.from:onboarding@resend.dev}")
    private String fromEmail;

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/mail-config")
    public ResponseEntity<?> getMailConfig() {
        Map<String, Object> config = new LinkedHashMap<>();
        config.put("provider", "Resend");
        config.put("configured", resendApiKey != null && !resendApiKey.isBlank());
        config.put("from", fromEmail);
        config.put("apiKeySet", resendApiKey != null && !resendApiKey.isBlank());
        return ResponseEntity.ok(config);
    }

    @PostMapping("/test-email")
    public ResponseEntity<?> testEmail(@RequestParam String to) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("to", to);
        result.put("from", fromEmail);

        if (resendApiKey == null || resendApiKey.isBlank()) {
            result.put("status", "FAILED");
            result.put("error", "RESEND_API_KEY is not configured");
            return ResponseEntity.ok(result);
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            Map<String, Object> body = Map.of(
                    "from", fromEmail,
                    "to", List.of(to),
                    "subject", "☕ Brew & Co — Test Email",
                    "html", "<p>If you receive this, Resend email is working! Sent at: " + java.time.LocalDateTime.now() + "</p>"
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> resp = restTemplate.postForEntity(
                    "https://api.resend.com/emails", request, String.class);

            result.put("status", "SUCCESS");
            result.put("message", "Email sent! Check inbox of: " + to);
            result.put("response", resp.getBody());
        } catch (Exception e) {
            result.put("status", "FAILED");
            result.put("error", e.getMessage());
        }

        return ResponseEntity.ok(result);
    }
}
