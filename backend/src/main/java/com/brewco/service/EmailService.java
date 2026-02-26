package com.brewco.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    /**
     * Check if email is actually configured (username + password present).
     * Spring Boot creates JavaMailSender even with empty credentials,
     * so we must check the actual values.
     */
    private boolean isMailConfigured() {
        if (mailSender == null) {
            return false;
        }
        if (fromEmail == null || fromEmail.isBlank()) {
            return false;
        }
        return true;
    }

    public void sendApprovalEmail(String toEmail, String firstName, String password) {
        System.out.println("============================================");
        System.out.println("📧 APPROVAL EMAIL REQUEST");
        System.out.println("   To:       " + toEmail);
        System.out.println("   Name:     " + firstName);
        System.out.println("   Password: " + password);
        System.out.println("   From:     " + fromEmail);
        System.out.println("   MailSender: " + (mailSender != null ? "AVAILABLE" : "NULL"));
        System.out.println("============================================");

        if (!isMailConfigured()) {
            System.out.println("⚠ ══════════════════════════════════════════");
            System.out.println("⚠ EMAIL NOT CONFIGURED — Printing credentials to console instead:");
            System.out.println("⚠");
            System.out.println("⚠   User Email:      " + toEmail);
            System.out.println("⚠   Login Password:  " + password);
            System.out.println("⚠");
            System.out.println("⚠   To enable email, set MAIL_USERNAME and MAIL_PASSWORD in .env");
            System.out.println("⚠ ══════════════════════════════════════════");
            return;
        }

        try {
            System.out.println("📧 Sending approval email via SMTP...");

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("☕ Brew & Co — Your Account Has Been Approved!");
            message.setText(
                    "Hello " + firstName + ",\n\n" +
                            "Great news! Your Brew & Co account has been approved by our admin team.\n\n" +
                            "Here are your login credentials:\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                            "  Email:    " + toEmail + "\n" +
                            "  Password: " + password + "\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                            "Please change your password after your first login for security.\n\n" +
                            "Login at: http://localhost:5173/login\n\n" +
                            "Welcome to the Brew & Co family! ☕\n\n" +
                            "Best regards,\n" +
                            "Brew & Co Admin Team");

            mailSender.send(message);
            System.out.println("✅ ══════════════════════════════════════════");
            System.out.println("✅ APPROVAL EMAIL SENT SUCCESSFULLY!");
            System.out.println("✅   To: " + toEmail);
            System.out.println("✅ ══════════════════════════════════════════");
        } catch (Exception e) {
            System.err.println("❌ ══════════════════════════════════════════");
            System.err.println("❌ FAILED TO SEND EMAIL");
            System.err.println("❌   To:         " + toEmail);
            System.err.println("❌   From:       " + fromEmail);
            System.err.println("❌   Error:      " + e.getMessage());
            System.err.println("❌   Error Type: " + e.getClass().getName());
            System.err.println("❌");
            System.err.println("❌   The user IS approved — password: " + password);
            System.err.println("❌   Share this password manually with the user.");
            System.err.println("❌ ══════════════════════════════════════════");
            e.printStackTrace();
            // Don't throw — the user is already approved; log and continue
        }
    }

    public void sendRejectionEmail(String toEmail, String firstName) {
        if (!isMailConfigured()) {
            System.out.println("⚠ Mail not configured. Skipping rejection email to: " + toEmail);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Brew & Co — Registration Update");
            message.setText(
                    "Hello " + firstName + ",\n\n" +
                            "We regret to inform you that your Brew & Co registration has not been approved at this time.\n\n"
                            +
                            "If you believe this was a mistake, please contact our support team.\n\n" +
                            "Best regards,\n" +
                            "Brew & Co Admin Team");

            mailSender.send(message);
            System.out.println("✅ Rejection email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send rejection email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendOrderConfirmationEmail(String toEmail, String firstName, String orderRef, java.math.BigDecimal total) {
        if (!isMailConfigured()) {
            System.out.println("⚠ EMAIL NOT CONFIGURED — Order " + orderRef + " placed for " + toEmail);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("☕ Order Confirmed — #" + orderRef);
            message.setText(
                    "Hello " + firstName + ",\n\n" +
                            "Thank you for ordering with Brew & Co!\n\n" +
                            "Your order #" + orderRef + " has been received and is being processed.\n" +
                            "Total Amount: ₹" + total + "\n\n" +
                            "You can track your order live on our platform.\n\n" +
                            "Enjoy your coffee! ☕\n\n" +
                            "Best regards,\n" +
                            "Brew & Co Team");

            mailSender.send(message);
            System.out.println("✅ Order confirmation sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send order email: " + e.getMessage());
        }
    }
}
