package com.brewco.service;

import com.brewco.dto.LoginRequest;
import com.brewco.dto.RegisterRequest;
import com.brewco.dto.UserDto;
import com.brewco.entity.User;
import com.brewco.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailVerificationService emailVerificationService;

    public User registerUser(RegisterRequest request) throws Exception {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new Exception("Email already registered. Please login or reset your password.");
        }

        // Determine role
        String role = (request.getRole() != null && !request.getRole().isBlank())
                ? request.getRole().toUpperCase()
                : "CUSTOMER";

        // Create new user (PASSWORD REMAINS NULL, GENERATED ON ADMIN APPROVAL)
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setGender(request.getGender());
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        user.setRole(role);

        // ALL newly registered users must be explicitly approved by Admin
        user.setIsActive(false);
        user.setIsEmailVerified(false);

        return userRepository.save(user);
    }

    public void verifyEmail(String email, String otp) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("User not found"));

        if (user.getIsEmailVerified() != null && user.getIsEmailVerified()) {
            throw new Exception("Email is already verified");
        }

        boolean isValid = emailVerificationService.verifyOtp(user, otp);
        if (!isValid) {
            throw new Exception("Invalid or expired OTP");
        }

        user.setIsEmailVerified(true);
        userRepository.save(user);
    }

    public void resendOtp(String email) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("User not found"));

        if (user.getIsEmailVerified() != null && user.getIsEmailVerified()) {
            throw new Exception("Email is already verified");
        }

        emailVerificationService.generateAndSendOtp(user);
    }

    public void processForgotPassword(String email) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("No account found with this email"));

        emailVerificationService.generateAndSendOtp(user);
    }

    public void resetPassword(String email, String otp, String newPassword) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("User not found"));

        boolean isValid = emailVerificationService.verifyOtp(user, otp);
        if (!isValid) {
            throw new Exception("Invalid or expired OTP");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public User loginUser(LoginRequest request) throws Exception {
        Optional<User> user = userRepository.findByEmail(request.getEmail());

        if (user.isEmpty()) {
            throw new Exception("No account found with this email. Please sign up first.");
        }

        User existingUser = user.get();

        // Check activation status FIRST (before password check)
        // Pending users from multi-step registration have NULL passwords
        if (!existingUser.getIsActive()) {
            throw new Exception("Your account is pending admin approval. Please wait for approval.");
        }

        // Verify password using BCrypt
        String savedHash = existingUser.getPasswordHash() != null ? existingUser.getPasswordHash()
                : existingUser.getPassword();
        if (savedHash == null || !passwordEncoder.matches(request.getPassword(), savedHash)) {
            // Check if plaintext password matches (for un-migrated users during transition)
            if (existingUser.getPassword() != null && existingUser.getPassword().equals(request.getPassword())) {
                // Good, but should be migrated. Handled by PasswordMigrationRunner.
            } else {
                throw new Exception("Invalid password");
            }
        }

        // Role is determined by the backend, not the frontend dropdown.
        // The frontend role picker is cosmetic only — no cross-verification needed.

        // Record login details
        existingUser.setLastLoginAt(LocalDateTime.now());

        // Initialize loginCount if null
        if (existingUser.getLoginCount() == null) {
            existingUser.setLoginCount(1);
        } else {
            existingUser.setLoginCount(existingUser.getLoginCount() + 1);
        }

        return userRepository.save(existingUser);
    }

    public User loginUserWithIp(LoginRequest request, String ipAddress) throws Exception {
        User existingUser = loginUser(request);
        existingUser.setLastLoginIp(ipAddress);
        return userRepository.save(existingUser);
    }

    public User getUserById(Long id) throws Exception {
        Optional<User> user = userRepository.findById(id);
        if (user.isEmpty()) {
            throw new Exception("User not found");
        }
        return user.get();
    }

    public User updateUserProfile(Long id, User updatedUser) throws Exception {
        User user = getUserById(id);

        if (updatedUser.getPhoneNumber() != null) {
            user.setPhoneNumber(updatedUser.getPhoneNumber());
        }

        return userRepository.save(user);
    }

    public UserDto convertToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setGender(user.getGender());
        dto.setIsActive(user.getIsActive());
        dto.setIsProfileComplete(user.getIsProfileComplete());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setIsEmailVerified(user.getIsEmailVerified());
        return dto;
    }
}
