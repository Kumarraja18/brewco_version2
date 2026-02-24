package com.brewco.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private String gender;
    private Boolean isActive;
    private Boolean isProfileComplete;
    private String phoneNumber;
    private Boolean isEmailVerified;
}
