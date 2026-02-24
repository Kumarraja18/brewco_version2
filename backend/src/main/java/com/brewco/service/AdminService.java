package com.brewco.service;

import com.brewco.entity.Address;
import com.brewco.entity.GovernmentProof;
import com.brewco.entity.User;
import com.brewco.entity.WorkExperience;
import com.brewco.repository.AddressRepository;
import com.brewco.repository.GovernmentProofRepository;
import com.brewco.repository.UserRepository;
import com.brewco.repository.WorkExperienceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private WorkExperienceRepository workExperienceRepository;

    @Autowired
    private GovernmentProofRepository governmentProofRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Dashboard statistics
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByIsActive(true);
        long pendingUsers = userRepository.countByIsActive(false);
        long totalCustomers = userRepository.countByRole("CUSTOMER");
        long totalCafeOwners = userRepository.countByRole("CAFE_OWNER");
        long totalChefs = userRepository.countByRole("CHEF");
        long totalWaiters = userRepository.countByRole("WAITER");

        stats.put("totalUsers", totalUsers);
        stats.put("activeUsers", activeUsers);
        stats.put("pendingUsers", pendingUsers);
        stats.put("totalCustomers", totalCustomers);
        stats.put("totalCafeOwners", totalCafeOwners);
        stats.put("totalChefs", totalChefs);
        stats.put("totalWaiters", totalWaiters);

        // Recent registrations (last 7 days)
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        long recentRegistrations = userRepository.countByCreatedAtAfter(sevenDaysAgo);
        stats.put("recentRegistrations", recentRegistrations);

        return stats;
    }

    // All users (simplified DTO)
    public List<Map<String, Object>> getAllUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::userToMap)
                .collect(Collectors.toList());
    }

    // Pending users (isActive = false, excluding admins)
    public List<Map<String, Object>> getPendingUsers() {
        return userRepository.findByIsActiveFalseOrderByCreatedAtDesc()
                .stream()
                .map(this::userToMap)
                .collect(Collectors.toList());
    }

    // Full user details with related entities
    public Map<String, Object> getUserFullDetails(Long userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        Map<String, Object> details = userToMap(user);

        // Add addresses
        List<Address> addresses = addressRepository.findByUserId(userId);
        List<Map<String, Object>> addressList = addresses.stream().map(a -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", a.getId());
            m.put("street", a.getStreet());
            m.put("city", a.getCity());
            m.put("state", a.getState());
            m.put("postalCode", a.getPostalCode());
            return m;
        }).collect(Collectors.toList());
        details.put("addresses", addressList);

        // Add work experiences
        List<WorkExperience> workExps = workExperienceRepository.findByUserId(userId);
        List<Map<String, Object>> workExpList = workExps.stream().map(w -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", w.getId());
            m.put("companyName", w.getCompanyName());
            m.put("position", w.getPosition());
            m.put("years", w.getYears());
            return m;
        }).collect(Collectors.toList());
        details.put("workExperiences", workExpList);

        // Add government proofs
        List<GovernmentProof> govProofs = governmentProofRepository.findByUserId(userId);
        List<Map<String, Object>> govProofList = govProofs.stream().map(g -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", g.getId());
            m.put("proofType", g.getProofType());
            m.put("proofNumber", g.getProofNumber());
            return m;
        }).collect(Collectors.toList());
        details.put("governmentProofs", govProofList);

        return details;
    }

    // Approve user — generate random password and send email
    public Map<String, Object> approveUser(Long userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        if (user.getIsActive()) {
            throw new Exception("User is already approved/active");
        }

        // Generate a random password
        String randomPassword = generateRandomPassword(10);

        // Set password and activate
        user.setPassword(randomPassword); // temporarily keeping it for legacy compatibility just in case
        user.setPasswordHash(passwordEncoder.encode(randomPassword));
        user.setIsActive(true);
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        // Send email with credentials
        emailService.sendApprovalEmail(user.getEmail(), user.getFirstName(), randomPassword);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "User approved successfully. Password sent to " + user.getEmail());
        result.put("userId", user.getId());
        result.put("email", user.getEmail());
        result.put("generatedPassword", randomPassword); // For admin reference
        return result;
    }

    // Reject user — remove from system
    public void rejectUser(Long userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        String email = user.getEmail();
        String firstName = user.getFirstName();

        // CascadeType.ALL + orphanRemoval=true handles child entity cleanup
        userRepository.delete(user);

        // Send rejection email
        emailService.sendRejectionEmail(email, firstName);
    }

    // Deactivate user
    public void deactivateUser(Long userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));
        user.setIsActive(false);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    // Activate user — if user has no password (first-time), generate one and send
    // email
    public Map<String, Object> activateUser(Long userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        Map<String, Object> result = new HashMap<>();
        boolean needsPassword = user.getPassword() == null || user.getPassword().isBlank();

        if (needsPassword) {
            // First-time activation = same as approval
            String randomPassword = generateRandomPassword(10);
            user.setPassword(randomPassword); // Keep for legacy
            user.setPasswordHash(passwordEncoder.encode(randomPassword));
            user.setIsActive(true);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);

            // Send email with credentials
            emailService.sendApprovalEmail(user.getEmail(), user.getFirstName(), randomPassword);

            result.put("message", "User activated and password sent to " + user.getEmail());
            result.put("generatedPassword", randomPassword);
        } else {
            // Reactivation (user was previously approved, just deactivated)
            user.setIsActive(true);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);

            result.put("message", "User reactivated successfully");
        }

        result.put("userId", user.getId());
        result.put("email", user.getEmail());
        return result;
    }

    // -- Helpers --

    private Map<String, Object> userToMap(User user) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", user.getId());
        map.put("firstName", user.getFirstName());
        map.put("lastName", user.getLastName());
        map.put("email", user.getEmail());
        map.put("phoneNumber", user.getPhoneNumber());
        map.put("gender", user.getGender());
        map.put("dateOfBirth", user.getDateOfBirth());
        map.put("role", user.getRole());
        map.put("isActive", user.getIsActive());
        map.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        map.put("updatedAt", user.getUpdatedAt() != null ? user.getUpdatedAt().toString() : null);
        map.put("lastLoginAt", user.getLastLoginAt() != null ? user.getLastLoginAt().toString() : null);
        map.put("loginCount", user.getLoginCount());
        return map;
    }

    private String generateRandomPassword(int length) {
        String upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String lower = "abcdefghijklmnopqrstuvwxyz";
        String digits = "0123456789";
        String special = "@#$!&";
        String all = upper + lower + digits + special;

        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();

        // Ensure at least one of each type
        sb.append(upper.charAt(random.nextInt(upper.length())));
        sb.append(lower.charAt(random.nextInt(lower.length())));
        sb.append(digits.charAt(random.nextInt(digits.length())));
        sb.append(special.charAt(random.nextInt(special.length())));

        // Fill the rest
        for (int i = 4; i < length; i++) {
            sb.append(all.charAt(random.nextInt(all.length())));
        }

        // Shuffle
        char[] arr = sb.toString().toCharArray();
        for (int i = arr.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }

        return new String(arr);
    }
}
