package com.brewco.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    private String password;
    private String confirmPassword;

    private String dateOfBirth;

    @NotBlank(message = "Gender is required")
    private String gender; // MALE, FEMALE, OTHER

    private String phoneNumber;
    private String role;

    // Address Details
    private String street;
    private String city;
    private String state;
    private String pincode;

    // Work Experience
    private String companyName;
    private String designation;
    private String startDate;
    private String endDate;
    private String ctc;
    private Boolean currentlyWorking;
    private String reasonForLeaving;

    // ID Proof
    private String idType;
    private String idNumber;
}
