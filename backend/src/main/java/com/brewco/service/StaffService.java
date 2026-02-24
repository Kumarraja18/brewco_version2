package com.brewco.service;

import com.brewco.entity.Cafe;
import com.brewco.entity.StaffAssignment;
import com.brewco.entity.User;
import com.brewco.repository.StaffAssignmentRepository;
import com.brewco.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StaffService {

    @Autowired
    private StaffAssignmentRepository staffAssignmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailVerificationService emailVerificationService;

    public List<StaffAssignment> getStaffForCafe(Cafe cafe) {
        return staffAssignmentRepository.findByCafe(cafe);
    }

    public List<StaffAssignment> getActiveStaffForCafe(Cafe cafe) {
        return staffAssignmentRepository.findByCafeAndIsActiveTrue(cafe);
    }

    public StaffAssignment assignStaffToCafe(User staffUser, Cafe cafe, String role, User assignedBy) {
        StaffAssignment assignment = new StaffAssignment();
        assignment.setStaff(staffUser);
        assignment.setCafe(cafe);
        assignment.setRole(role);
        assignment.setIsActive(true);
        assignment.setAssignedBy(assignedBy);
        return staffAssignmentRepository.save(assignment);
    }

    public Optional<StaffAssignment> getActiveAssignmentForStaff(User staff) {
        return staffAssignmentRepository.findByStaffAndIsActiveTrue(staff);
    }

    public Optional<StaffAssignment> getAssignmentById(Long id) {
        return staffAssignmentRepository.findById(id);
    }

    /**
     * Creates a new staff user (chef or waiter) and assigns them to the cafe.
     * Auto-generates a secure password and emails it to the staff member.
     */
    public StaffAssignment createAndAssignStaff(String firstName, String lastName, String email,
            String tempPassword, String role, Cafe cafe, User assignedBy) throws Exception {
        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            throw new Exception("A user with this email already exists");
        }

        // Auto-generate a secure password if not provided or default
        String actualPassword;
        if (tempPassword == null || tempPassword.isBlank() || "Staff@123".equals(tempPassword)) {
            String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";
            StringBuilder sb = new StringBuilder();
            java.util.Random rng = new java.util.Random();
            for (int i = 0; i < 10; i++) {
                sb.append(chars.charAt(rng.nextInt(chars.length())));
            }
            actualPassword = sb.toString();
        } else {
            actualPassword = tempPassword;
        }

        // Create the staff user
        User staffUser = new User();
        staffUser.setFirstName(firstName);
        staffUser.setLastName(lastName != null ? lastName : "");
        staffUser.setEmail(email);
        staffUser.setPasswordHash(passwordEncoder.encode(actualPassword));
        staffUser.setGender("OTHER"); // Not collected during staff creation
        staffUser.setRole(role.toUpperCase()); // CHEF or WAITER
        staffUser.setIsActive(true);
        staffUser.setIsEmailVerified(true); // Staff added by owner are pre-verified
        staffUser = userRepository.save(staffUser);

        // Email the password to the staff member
        emailVerificationService.sendWelcomeWithPasswordEmail(email, firstName, actualPassword);

        // Assign to cafe
        return assignStaffToCafe(staffUser, cafe, role.toUpperCase(), assignedBy);
    }

    public void deactivateAssignment(StaffAssignment assignment) {
        assignment.setIsActive(false);
        staffAssignmentRepository.save(assignment);
    }
}
