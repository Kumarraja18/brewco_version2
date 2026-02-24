package com.brewco.controller;

import com.brewco.service.AdminService;
import com.brewco.entity.Cafe;
import com.brewco.repository.CafeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private CafeRepository cafeRepository;

    // Dashboard stats
    @GetMapping("/dashboard-stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            Map<String, Object> stats = adminService.getDashboardStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // All users
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            return ResponseEntity.ok(adminService.getAllUsers());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Pending registration users (isActive = false)
    @GetMapping("/pending-users")
    public ResponseEntity<?> getPendingUsers() {
        try {
            return ResponseEntity.ok(adminService.getPendingUsers());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get a single user with full details (addresses, work exp, govt proof)
    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUserFullDetails(@PathVariable("id") Long id) {
        try {
            return ResponseEntity.ok(adminService.getUserFullDetails(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Approve user — generates random password and sends email
    @PutMapping("/approve/{id}")
    public ResponseEntity<?> approveUser(@PathVariable("id") Long id) {
        try {
            Map<String, Object> result = adminService.approveUser(id);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Reject user
    @DeleteMapping("/reject/{id}")
    public ResponseEntity<?> rejectUser(@PathVariable("id") Long id) {
        try {
            adminService.rejectUser(id);
            return ResponseEntity.ok(Map.of("message", "User rejected and removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Deactivate user
    @PutMapping("/deactivate/{id}")
    public ResponseEntity<?> deactivateUser(@PathVariable("id") Long id) {
        try {
            adminService.deactivateUser(id);
            return ResponseEntity.ok(Map.of("message", "User deactivated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Activate user
    @PutMapping("/activate/{id}")
    public ResponseEntity<?> activateUser(@PathVariable("id") Long id) {
        try {
            Map<String, Object> result = adminService.activateUser(id);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Cafe Management ---

    @GetMapping("/cafes/pending")
    public ResponseEntity<?> getPendingCafes() {
        List<Cafe> pendingCafes = cafeRepository.findAll().stream()
                .filter(cafe -> !cafe.getIsVerified())
                .collect(Collectors.toList());
        return ResponseEntity.ok(pendingCafes);
    }

    @PutMapping("/cafes/{id}/verify")
    public ResponseEntity<?> verifyCafe(@PathVariable("id") Long id) {
        return cafeRepository.findById(id).map(cafe -> {
            cafe.setIsVerified(true);
            cafeRepository.save(cafe);
            return ResponseEntity.ok(Map.of("message", "Cafe verified successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/cafes/{id}/reject")
    public ResponseEntity<?> rejectCafe(@PathVariable("id") Long id) {
        return cafeRepository.findById(id).map(cafe -> {
            cafe.setIsVerified(false);
            cafe.setIsActive(false);
            cafeRepository.save(cafe);
            return ResponseEntity.ok(Map.of("message", "Cafe application rejected"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/cafes/{id}")
    public ResponseEntity<?> deleteCafe(@PathVariable("id") Long id) {
        if (cafeRepository.existsById(id)) {
            cafeRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Cafe deleted permanently"));
        }
        return ResponseEntity.notFound().build();
    }
}
