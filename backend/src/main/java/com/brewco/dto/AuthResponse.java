package com.brewco.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private Boolean success;
    private String message;
    private UserDto user;
    private String token;

    public AuthResponse(Boolean success, String message) {
        this.success = success;
        this.message = message;
    }
}
