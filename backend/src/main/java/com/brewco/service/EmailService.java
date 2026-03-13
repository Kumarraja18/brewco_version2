package com.brewco.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    @Value("${resend.api-key:}")
    private String resendApiKey;

    @Value("${resend.from:onboarding@resend.dev}")
    private String fromEmail;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    private boolean isConfigured() {
        return resendApiKey != null && !resendApiKey.isBlank();
    }

    private void send(String to, String subject, String html) {
        if (!isConfigured()) {
            System.out.println("⚠ RESEND_API_KEY not set — skipping email to: " + to);
            return;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            Map<String, Object> body = Map.of(
                    "from", fromEmail,
                    "to", List.of(to),
                    "subject", subject,
                    "html", html
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> resp = restTemplate.postForEntity(
                    "https://api.resend.com/emails", request, String.class);

            System.out.println("✅ Email sent to " + to + " | status=" + resp.getStatusCode());
        } catch (Exception e) {
            System.err.println("❌ Resend email failed to " + to + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendApprovalEmail(String toEmail, String firstName, String password) {
        System.out.println("📧 APPROVAL EMAIL → " + toEmail + " | password=" + password);

        if (!isConfigured()) {
            System.out.println("⚠ RESEND_API_KEY not set. Credentials for " + toEmail + ": " + password);
            return;
        }

        String html = "<div style='font-family:Arial,sans-serif;max-width:500px;margin:0 auto;'>"
                + "<h2 style='color:#6f4e37;'>☕ Brew &amp; Co</h2>"
                + "<p>Hello <strong>" + firstName + "</strong>,</p>"
                + "<p>Great news! Your account has been <strong>approved</strong> by our admin team.</p>"
                + "<div style='background:#f9f5f0;border:1px solid #d4c0a8;border-radius:10px;padding:16px;margin:16px 0;'>"
                + "<p style='margin:4px 0;'><strong>Email:</strong> " + toEmail + "</p>"
                + "<p style='margin:4px 0;'><strong>Password:</strong> " + password + "</p>"
                + "</div>"
                + "<p>Please change your password after your first login.</p>"
                + "<p><a href='" + frontendUrl + "/login' style='background:#6f4e37;color:#fff;padding:10px 24px;"
                + "border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;'>Login Now</a></p>"
                + "<br><p>Welcome to the Brew &amp; Co family! ☕</p>"
                + "<p style='color:#999;font-size:12px;'>— Brew &amp; Co Admin Team</p>"
                + "</div>";

        send(toEmail, "☕ Brew & Co — Your Account Has Been Approved!", html);
    }

    public void sendRejectionEmail(String toEmail, String firstName) {
        if (!isConfigured()) {
            System.out.println("⚠ Resend not configured. Skipping rejection email to: " + toEmail);
            return;
        }

        String html = "<div style='font-family:Arial,sans-serif;max-width:500px;margin:0 auto;'>"
                + "<h2 style='color:#6f4e37;'>Brew &amp; Co</h2>"
                + "<p>Hello <strong>" + firstName + "</strong>,</p>"
                + "<p>We regret to inform you that your registration has not been approved at this time.</p>"
                + "<p>If you believe this was a mistake, please contact our support team.</p>"
                + "<br><p style='color:#999;font-size:12px;'>— Brew &amp; Co Admin Team</p>"
                + "</div>";

        send(toEmail, "Brew & Co — Registration Update", html);
    }

    public void sendOrderConfirmationEmail(String toEmail, String firstName, String orderRef, java.math.BigDecimal total) {
        if (!isConfigured()) {
            System.out.println("⚠ Resend not configured — Order " + orderRef + " for " + toEmail);
            return;
        }

        String html = "<div style='font-family:Arial,sans-serif;max-width:500px;margin:0 auto;'>"
                + "<h2 style='color:#6f4e37;'>☕ Order Confirmed</h2>"
                + "<p>Hello <strong>" + firstName + "</strong>,</p>"
                + "<p>Your order <strong>#" + orderRef + "</strong> has been received!</p>"
                + "<div style='background:#f9f5f0;border:1px solid #d4c0a8;border-radius:10px;padding:16px;margin:16px 0;'>"
                + "<p style='margin:4px 0;font-size:18px;font-weight:bold;'>Total: ₹" + total + "</p>"
                + "</div>"
                + "<p>Track your order live on our platform.</p>"
                + "<p><a href='" + frontendUrl + "/my-orders' style='background:#6f4e37;color:#fff;padding:10px 24px;"
                + "border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;'>Track Order</a></p>"
                + "<br><p>Enjoy your coffee! ☕</p>"
                + "<p style='color:#999;font-size:12px;'>— Brew &amp; Co Team</p>"
                + "</div>";

        send(toEmail, "☕ Order Confirmed — #" + orderRef, html);
    }
}
