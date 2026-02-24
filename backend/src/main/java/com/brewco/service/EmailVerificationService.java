package com.brewco.service;

import com.brewco.entity.EmailVerification;
import com.brewco.entity.User;
import com.brewco.repository.EmailVerificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class EmailVerificationService {

    @Autowired
    private EmailVerificationRepository emailVerificationRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    private static final int OTP_EXPIRY_MINUTES = 10;

    public void generateAndSendOtp(User user) {
        // Delete any existing OTP for this user
        emailVerificationRepository.deleteByUser(user);

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));

        // Save new OTP
        EmailVerification verification = new EmailVerification();
        verification.setUser(user);
        verification.setOtp(otp);
        verification.setExpiryDate(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        emailVerificationRepository.save(verification);

        // Only attempt to send email if SMTP is configured
        if (fromEmail != null && !fromEmail.isEmpty()) {
            sendOtpEmail(user.getEmail(), otp);
        } else {
            System.out.println("SMTP not configured. OTP for " + user.getEmail() + " is: " + otp);
        }
    }

    private void sendOtpEmail(String to, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Brew & Co - Your Verification Code");
            message.setText("Your verification code is: " + otp + "\n\nThis code will expire in " + OTP_EXPIRY_MINUTES
                    + " minutes.");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send OTP email to " + to + ": " + e.getMessage());
        }
    }

    public void sendWelcomeWithPasswordEmail(String to, String firstName, String temporaryPassword) {
        if (fromEmail == null || fromEmail.isEmpty()) {
            System.out.println("SMTP not configured. Temporary password for " + to + " is: " + temporaryPassword);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Welcome to Brew & Co - Your Login Credentials");
            message.setText(
                    "Hi " + firstName + ",\n\n" +
                            "Welcome to Brew & Co! Your account has been created successfully.\n\n" +
                            "Your login credentials:\n" +
                            "  Email:    " + to + "\n" +
                            "  Password: " + temporaryPassword + "\n\n" +
                            "Please log in and verify your email using the OTP that will be sent separately.\n" +
                            "We recommend changing your password after your first login.\n\n" +
                            "Thank you for joining Brew & Co!\n\n" +
                            "– The Brew & Co Team");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send welcome email to " + to + ": " + e.getMessage());
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
