package com.brewco.controller;

import com.brewco.dto.AddressDto;
import com.brewco.dto.GovernmentProofDto;
import com.brewco.dto.WorkExperienceDto;
import com.brewco.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/register")
@CrossOrigin(origins = "http://localhost:5173")
public class RegistrationController {

    @Autowired
    private RegistrationService registrationService;

    // Step 1: Save Personal Details
    @PostMapping("/step1/personal-details")
    public ResponseEntity<?> savePersonalDetails(@RequestBody Map<String, Object> details) {
        try {
            Map<String, Object> response = registrationService.savePersonalDetails(details);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Step 2: Save Address
    @PostMapping("/step2/address/{userId}")
    public ResponseEntity<?> saveAddress(@PathVariable("userId") Long userId, @RequestBody AddressDto addressDto) {
        try {
            Map<String, Object> response = registrationService.saveAddress(userId, addressDto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Step 3: Save Work Experience
    @PostMapping("/step3/work-experience/{userId}")
    public ResponseEntity<?> saveWorkExperience(@PathVariable("userId") Long userId,
            @RequestBody WorkExperienceDto workExpDto) {
        try {
            Map<String, Object> response = registrationService.saveWorkExperience(userId, workExpDto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Step 4: Save Government Proof
    @PostMapping("/step4/govt-proof/{userId}")
    public ResponseEntity<?> saveGovernmentProof(@PathVariable("userId") Long userId,
            @RequestBody GovernmentProofDto govProofDto) {
        try {
            Map<String, Object> response = registrationService.saveGovernmentProof(userId, govProofDto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get registration status
    @GetMapping("/status/{userId}")
    public ResponseEntity<?> getRegistrationStatus(@PathVariable("userId") Long userId) {
        try {
            Map<String, Object> status = registrationService.getRegistrationStatus(userId);
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
