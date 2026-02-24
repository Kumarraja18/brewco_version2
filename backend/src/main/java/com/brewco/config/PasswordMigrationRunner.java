package com.brewco.config;

import com.brewco.entity.User;
import com.brewco.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
public class PasswordMigrationRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(PasswordMigrationRunner.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordMigrationRunner(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking for users requiring password migration...");
        List<User> users = userRepository.findAll();
        int migratedCount = 0;

        for (User user : users) {
            if (user.getPassword() != null && user.getPasswordHash() == null) {
                user.setPasswordHash(passwordEncoder.encode(user.getPassword()));
                userRepository.save(user);
                migratedCount++;
                log.info("Migrated password for user: {}", user.getEmail());
            }
        }

        if (migratedCount > 0) {
            log.info("Successfully migrated {} user passwords to BCrypt", migratedCount);
        } else {
            log.info("No users required password migration.");
        }
    }
}
