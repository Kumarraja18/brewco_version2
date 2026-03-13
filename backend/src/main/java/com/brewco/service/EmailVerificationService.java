package com.brewco.service;

import com.brewco.entity.EmailVerification;
import com.brewco.entity.User;
import com.brewco.repository.EmailVerificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@Service
public class EmailVerificationService {

    @Autowired
    private EmailVerificationRepository emailVerificationRepository;

    @Value("${resend.api-key:}")
    private String resendApiKey;

    @Value("${resend.from:onboarding@resend.dev}")
    private String fromEmail;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final int OTP_EXPIRY_MINUTES = 10;

    public void generateAndSendOtp(User user) {
        emailVerificationRepository.deleteByUser(user);

        String otp = String.format("%06d", new Random().nextInt(999999));

        EmailVerification verification = new EmailVerification();
        verification.setUser(user);
        verification.setOtp(otp);
        verification.setExpiryDate(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        emailVerificationRepository.save(verification);

        if (resendApiKey != null && !resendApiKey.isBlank()) {
            sendOtpEmail(user.getEmail(), otp);
        } else {
            System.out.println("Resend not configured. OTP for " + user.getEmail() + " is: " + otp);
        }
    }

    private void sendOtpEmail(String to, String otp) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            String html = "<div style='font-family:Arial,sans-serif;'>"
                    + "<h2 style='color:#6f4e37;'>☕ Brew &amp; Co</h2>"
                    + "<p>Your verification code is:</p>"
                    + "<div style='background:#f9f5f0;border:1px solid #d4c0a8;border-radius:10px;padding:20px;"
                    + "margin:16px 0;text-align:center;font-size:28px;font-weight:bold;letter-spacing:6px;'>"
                    + otp + "</div>"
                    + "<p>This code expires in " + OTP_EXPIRY_MINUTES + " minutes.</p>"
                    + "</div>";

            Map<String, Object> body = Map.of(
                    "from", fromEmail,
                    "to", List.of(to),
                    "subject", "Brew & Co — Your Verification Code",
                    "html", html
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            restTemplate.postForEntity("https://api.resend.com/emails", request, String.class);
            System.out.println("✅ OTP email sent to " + to);
        } catch (Exception e) {
            System.err.println("❌ Failed to send OTP email to " + to + ": " + e.getMessage());
        }
    }

    public void sendWelcomeWithPasswordEmail(String to, String firstName, String temporaryPassword) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            System.out.println("Resend not configured. Temporary password for " + to + " is: " + temporaryPassword);
            return;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            String html = "<div style='font-family:Arial,sans-serif;'>"
                    + "<h2 style='color:#6f4e37;'>☕ Welcome to Brew &amp; Co!</h2>"
                    + "<p>Hi <strong>" + firstName + "</strong>,</p>"
                    + "<p>Your account has been created. Here are your credentials:</p>"
                    + "<div style='background:#f9f5f0;border:1px solid #d4c0a8;border-radius:10px;padding:16px;margin:16px 0;'>"
                    + "<p style='margin:4px 0;'><strong>Email:</strong> " + to + "</p>"
                    + "<p style='margin:4px 0;'><strong>Password:</strong> " + temporaryPassword + "</p>"
                    + "</div>"
                    + "<p>Please change your password after first login.</p>"
                    + "</div>";

            Map<String, Object> body = Map.of(
                    "from", fromEmail,
                    "to", List.of(to),
                    "subject", "Welcome to Brew & Co — Your Login Credentials",
                    "html", html
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            restTemplate.postForEntity("https://api.resend.com/emails", request, String.class);
            System.out.println("✅ Welcome email sent to " + to);
        } catch (Exception e) {
            System.err.println("❌ Failed to send welcome email to " + to + ": " + e.getMessage());
        }
    }

    public boolean verifyOtp(User user, String otp) {
        Optional<EmailVerification> verificationOpt = emailVerificationRepository.findByUserAndOtp(user, otp);
        if (verificationOpt.isPresent()) {
            EmailVerification verification = verificationOpt.get();
            if (verification.getExpiryDate().isAfter(LocalDateTime.now())) {
                emailVerificationRepository.deleteByUser(user);
                return true;
            }
        }
        return false;
    }
}
