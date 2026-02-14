package com.brewco.config;

import com.brewco.entity.User;
import com.brewco.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Value("${ADMIN_EMAIL}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        // Check if admin user already exists
        if (!userRepository.existsByEmail(adminEmail)) {
            User adminUser = new User();
            adminUser.setFirstName("Admin");
            adminUser.setLastName("BrewCo");
            adminUser.setEmail(adminEmail);
            adminUser.setPassword(adminPassword);
            adminUser.setGender("MALE");
            adminUser.setRole("ADMIN");
            adminUser.setIsActive(true);
            adminUser.setCreatedAt(LocalDateTime.now());
            adminUser.setUpdatedAt(LocalDateTime.now());
            adminUser.setLoginCount(0);

            userRepository.save(adminUser);
            System.out.println("✓ Default admin user created successfully!");
            System.out.println("  Email: " + adminEmail);
        } else {
            System.out.println("✓ Admin user already exists. Skipping initialization.");
        }
    }
}
