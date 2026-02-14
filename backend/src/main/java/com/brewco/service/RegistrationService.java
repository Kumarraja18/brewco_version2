package com.brewco.service;

import com.brewco.dto.AddressDto;
import com.brewco.dto.GovernmentProofDto;
import com.brewco.dto.WorkExperienceDto;
import com.brewco.entity.Address;
import com.brewco.entity.GovernmentProof;
import com.brewco.entity.User;
import com.brewco.entity.WorkExperience;
import com.brewco.repository.AddressRepository;
import com.brewco.repository.GovernmentProofRepository;
import com.brewco.repository.UserRepository;
import com.brewco.repository.WorkExperienceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class RegistrationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private WorkExperienceRepository workExperienceRepository;

    @Autowired
    private GovernmentProofRepository governmentProofRepository;

    // Step 1: Save Personal Details (Create user entry)
    public Map<String, Object> savePersonalDetails(Map<String, Object> details) throws Exception {
        String email = (String) details.get("email");

        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            throw new Exception("Email already registered");
        }

        User user = new User();
        user.setFirstName((String) details.get("firstName"));
        user.setLastName((String) details.get("lastName"));
        user.setEmail(email);
        user.setPhoneNumber((String) details.get("phone"));
        user.setGender((String) details.get("gender"));
        user.setRole("CUSTOMER"); // Set default role
        user.setIsActive(false); // Not active until admin approves

        User savedUser = userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("userId", savedUser.getId());
        response.put("message", "Personal details saved successfully");
        response.put("status", "pending");
        return response;
    }

    // Step 2: Save Address
    public Map<String, Object> saveAddress(Long userId, AddressDto addressDto) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        Address address = new Address();
        address.setUser(user);
        address.setStreet(addressDto.getStreet());
        address.setCity(addressDto.getCity());
        address.setPostalCode(addressDto.getPostalCode());

        addressRepository.save(address);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Address saved successfully");
        return response;
    }

    // Step 3: Save Work Experience
    public Map<String, Object> saveWorkExperience(Long userId, WorkExperienceDto workExpDto) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        WorkExperience workExp = new WorkExperience();
        workExp.setUser(user);
        workExp.setCompanyName(workExpDto.getCompanyName());
        workExp.setPosition(workExpDto.getPosition());
        workExp.setYears(workExpDto.getYears());

        workExperienceRepository.save(workExp);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Work experience saved successfully");
        return response;
    }

    // Step 4: Save Government Proof
    public Map<String, Object> saveGovernmentProof(Long userId, GovernmentProofDto govProofDto) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        GovernmentProof govProof = new GovernmentProof();
        govProof.setUser(user);
        govProof.setProofType(govProofDto.getProofType());
        govProof.setProofNumber(govProofDto.getProofNumber());

        governmentProofRepository.save(govProof);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Government proof saved successfully");
        response.put("status", "pending_approval");
        return response;
    }

    // Get registration status for a user
    public Map<String, Object> getRegistrationStatus(Long userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        Map<String, Object> status = new HashMap<>();
        status.put("userId", user.getId());
        status.put("email", user.getEmail());
        status.put("isActive", user.getIsActive());
        status.put("hasAddress", !addressRepository.findByUserId(userId).isEmpty());
        status.put("hasWorkExp", !workExperienceRepository.findByUserId(userId).isEmpty());
        status.put("hasGovProof", !governmentProofRepository.findByUserId(userId).isEmpty());

        return status;
    }
}
