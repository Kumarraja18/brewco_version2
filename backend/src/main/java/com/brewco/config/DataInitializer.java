package com.brewco.config;

import com.brewco.entity.User;
import com.brewco.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${ADMIN_EMAIL:v.kumarraja2018@gmail.com}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD:kumar0237}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        try {
            if (!userRepository.existsByEmail(adminEmail)) {
                User adminUser = new User();
                adminUser.setFirstName("Kumarraja");
                adminUser.setLastName("Vaddadi");
                adminUser.setEmail(adminEmail);
                adminUser.setPassword(adminPassword);
                adminUser.setPasswordHash(passwordEncoder.encode(adminPassword));
                adminUser.setGender("MALE");
                adminUser.setDateOfBirth("2005-11-29");
                adminUser.setMobileNumber("9392708749");
                adminUser.setPhoneNumber("9392708749");
                adminUser.setRole("ADMIN");
                adminUser.setIsActive(true);
                adminUser.setIsEmailVerified(true);
                adminUser.setIsProfileComplete(true);
                adminUser.setCreatedAt(LocalDateTime.now());
                adminUser.setUpdatedAt(LocalDateTime.now());
                adminUser.setLoginCount(0);

                userRepository.save(adminUser);
                System.out.println("============================================");
                System.out.println("✓ Admin user created successfully!");
                System.out.println("  Name:     Kumarraja Vaddadi");
                System.out.println("  Email:    " + adminEmail);
                System.out.println("  Password: " + adminPassword);
                System.out.println("============================================");
            } else {
                // Admin exists — make sure the name, role, and active flag are correct
                User existing = userRepository.findByEmail(adminEmail).orElse(null);
                if (existing != null) {
                    boolean changed = false;
                    if (!"Kumarraja".equals(existing.getFirstName())) {
                        existing.setFirstName("Kumarraja");
                        changed = true;
                    }
                    if (!"Vaddadi".equals(existing.getLastName())) {
                        existing.setLastName("Vaddadi");
                        changed = true;
                    }
                    if (!"ADMIN".equals(existing.getRole())) {
                        existing.setRole("ADMIN");
                        changed = true;
                    }
                    if (!Boolean.TRUE.equals(existing.getIsActive())) {
                        existing.setIsActive(true);
                        changed = true;
                    }
                    if (!Boolean.TRUE.equals(existing.getIsEmailVerified())) {
                        existing.setIsEmailVerified(true);
                        changed = true;
                    }
                    if (!Boolean.TRUE.equals(existing.getIsProfileComplete())) {
                        existing.setIsProfileComplete(true);
                        changed = true;
                    }
                    // Always re-hash password to keep it in sync with .env
                    if (!passwordEncoder.matches(adminPassword,
                            existing.getPasswordHash() != null ? existing.getPasswordHash() : "")) {
                        existing.setPasswordHash(passwordEncoder.encode(adminPassword));
                        existing.setPassword(adminPassword);
                        changed = true;
                    }
                    if (changed) {
                        existing.setUpdatedAt(LocalDateTime.now());
                        userRepository.save(existing);
                        System.out.println("✓ Admin user updated — details synced from .env");
                    } else {
                        System.out.println("✓ Admin user already up-to-date. Email: " + adminEmail);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("⚠ DataInitializer warning: " + e.getMessage());
            System.err.println("  The app will still work. Create admin via add_admin.sql if needed.");
        }
    }
}
