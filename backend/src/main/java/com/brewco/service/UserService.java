package com.brewco.service;

import com.brewco.dto.LoginRequest;
import com.brewco.dto.RegisterRequest;
import com.brewco.dto.UserDto;
import com.brewco.entity.User;
import com.brewco.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User registerUser(RegisterRequest request) throws Exception {
        // Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new Exception("Passwords do not match");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new Exception("Email already registered");
        }

        // Create new user
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // In production, hash this password!
        user.setDateOfBirth(request.getDateOfBirth());
        user.setGender(request.getGender());
        user.setRole("CUSTOMER"); // Default role for new users
        user.setIsActive(true);

        return userRepository.save(user);
    }

    public User loginUser(LoginRequest request) throws Exception {
        Optional<User> user = userRepository.findByEmail(request.getEmail());

        if (user.isEmpty()) {
            throw new Exception("User not found");
        }

        User existingUser = user.get();

        // Simple password check (in production, use BCrypt!)
        if (!existingUser.getPassword().equals(request.getPassword())) {
            throw new Exception("Invalid password");
        }

        if (!existingUser.getIsActive()) {
            throw new Exception("User account is inactive");
        }

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
        if (updatedUser.getStreetAddress() != null) {
            user.setStreetAddress(updatedUser.getStreetAddress());
        }
        if (updatedUser.getPlotNumber() != null) {
            user.setPlotNumber(updatedUser.getPlotNumber());
        }
        if (updatedUser.getCity() != null) {
            user.setCity(updatedUser.getCity());
        }
        if (updatedUser.getPostalCode() != null) {
            user.setPostalCode(updatedUser.getPostalCode());
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
        return dto;
    }
}
