package com.brewco.controller;

import com.brewco.dto.AuthResponse;
import com.brewco.dto.LoginRequest;
import com.brewco.dto.RegisterRequest;
import com.brewco.entity.User;
import com.brewco.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import com.brewco.entity.RefreshToken;
import com.brewco.service.RefreshTokenService;
import com.brewco.repository.UserRepository;
import com.brewco.dto.*;
import com.brewco.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping({ "/register", "/register/customer" })
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User user = userService.registerUser(request);
            AuthResponse response = new AuthResponse(true,
                    "Registration request sent successfully! You will receive a password via email once an Admin approves your account.");
            response.setUser(userService.convertToDto(user));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AuthResponse response = new AuthResponse(false, e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest,
            HttpServletResponse servletResponse) {
        try {
            // Get client IP address
            String ipAddress = getClientIp(servletRequest);

            User user = userService.loginUserWithIp(request, ipAddress);

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String jwt = jwtUtil.generateToken(userDetails);

            ResponseCookie accessCookie = ResponseCookie.from("access_token", jwt)
                    .httpOnly(true).secure(true).sameSite("None")
                    .path("/").maxAge(15 * 60).build();
            servletResponse.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());

            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
            ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken.getToken())
                    .httpOnly(true).secure(true).sameSite("None")
                    .path("/").maxAge(7 * 24 * 60 * 60).build();
            servletResponse.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

            AuthResponse response = new AuthResponse(true, "Login successful");
            response.setUser(userService.convertToDto(user));
            response.setToken(jwt); // Temporary compatibility shim
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AuthResponse response = new AuthResponse(false, e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor == null || xForwardedFor.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xForwardedFor.split(",")[0].trim();
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        try {
            userService.verifyEmail(request.getEmail(), request.getOtp());
            return ResponseEntity.ok(new AuthResponse(true, "Email verified successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        try {
            userService.resendOtp(request.getEmail());
            return ResponseEntity.ok(new AuthResponse(true, "OTP resent to your email"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            userService.processForgotPassword(request.getEmail());
            return ResponseEntity.ok(new AuthResponse(true, "OTP sent to your email for password reset"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            userService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
            return ResponseEntity.ok(new AuthResponse(true, "Password reset successfully. You can now login."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(401).body(new AuthResponse(false, "Not authenticated"));
        }
        try {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new Exception("User not found"));
            return ResponseEntity.ok(userService.convertToDto(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(
            @CookieValue(name = "refresh_token", required = false) String requestRefreshToken,
            HttpServletResponse servletResponse) {
        if (requestRefreshToken == null || requestRefreshToken.isEmpty()) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Refresh token is missing"));
        }

        try {
            RefreshToken refreshToken = refreshTokenService.findByToken(requestRefreshToken)
                    .orElseThrow(() -> new Exception("Refresh token is not in database"));

            refreshToken = refreshTokenService.verifyExpiration(refreshToken);
            User user = refreshToken.getUser();

            String jwt = jwtUtil.generateToken(
                    new org.springframework.security.core.userdetails.User(
                            user.getEmail(), user.getPasswordHash() != null ? user.getPasswordHash() : "",
                            java.util.Collections.singletonList(
                                    new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                            "ROLE_" + user.getRole().toUpperCase()))));

            // Set the new access_token cookie so browser auto-sends it
            ResponseCookie accessCookie = ResponseCookie.from("access_token", jwt)
                    .httpOnly(true).secure(true).sameSite("None")
                    .path("/").maxAge(15 * 60).build();
            servletResponse.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());

            AuthResponse response = new AuthResponse(true, "Token refreshed successfully");
            response.setToken(jwt); // Temporary compatibility shim
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response, Authentication authentication) {
        try {
            if (authentication != null && authentication.isAuthenticated()) {
                UserDetails userDetails = (UserDetails) authentication.getPrincipal();
                User user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
                if (user != null) {
                    refreshTokenService.deleteByUserId(user.getId());
                }
            }
        } catch (Exception e) {
            // ignore
        }

        ResponseCookie clearAccess = ResponseCookie.from("access_token", "")
                .httpOnly(true).secure(true).sameSite("None")
                .path("/").maxAge(0).build();
        response.addHeader(HttpHeaders.SET_COOKIE, clearAccess.toString());

        ResponseCookie clearRefresh = ResponseCookie.from("refresh_token", "")
                .httpOnly(true).secure(true).sameSite("None")
                .path("/").maxAge(0).build();
        response.addHeader(HttpHeaders.SET_COOKIE, clearRefresh.toString());

        return ResponseEntity.ok(new AuthResponse(true, "Logged out successfully"));
    }

    /** PUT /api/auth/change-password — change password for authenticated user */
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request, Authentication authentication) {
        try {
            User currentUser = userRepository.findByEmail(authentication.getName()).orElseThrow();
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");

            if (currentPassword == null || newPassword == null || newPassword.length() < 6) {
                return ResponseEntity.badRequest().body(new AuthResponse(false, "currentPassword and newPassword (min 6 chars) are required"));
            }

            String savedHash = currentUser.getPasswordHash() != null ? currentUser.getPasswordHash() : currentUser.getPassword();
            if (savedHash == null || !passwordEncoder.matches(currentPassword, savedHash)) {
                return ResponseEntity.badRequest().body(new AuthResponse(false, "Current password is incorrect"));
            }

            currentUser.setPasswordHash(passwordEncoder.encode(newPassword));
            userRepository.save(currentUser);
            return ResponseEntity.ok(new AuthResponse(true, "Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUser(@PathVariable("id") Long id) {
        try {
            User user = userService.getUserById(id);
            return ResponseEntity.ok(userService.convertToDto(user));
        } catch (Exception e) {
            AuthResponse response = new AuthResponse(false, e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/user/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable("id") Long id, @RequestBody User user) {
        try {
            User updatedUser = userService.updateUserProfile(id, user);
            AuthResponse response = new AuthResponse(true, "Profile updated successfully");
            response.setUser(userService.convertToDto(updatedUser));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AuthResponse response = new AuthResponse(false, e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /** PUT /api/auth/profile — update the currently authenticated user's profile */
    @PutMapping("/profile")
    public ResponseEntity<?> updateAuthenticatedProfile(@RequestBody Map<String, Object> updates,
            Authentication authentication) {
        try {
            User currentUser = userRepository.findByEmail(authentication.getName()).orElseThrow();
            if (updates.containsKey("isProfileComplete")) {
                currentUser.setIsProfileComplete(Boolean.parseBoolean(updates.get("isProfileComplete").toString()));
            }
            if (updates.containsKey("firstName")) {
                currentUser.setFirstName(updates.get("firstName").toString());
            }
            if (updates.containsKey("lastName")) {
                currentUser.setLastName(updates.get("lastName").toString());
            }
            if (updates.containsKey("phoneNumber")) {
                currentUser.setPhoneNumber(updates.get("phoneNumber").toString());
            }
            User saved = userRepository.save(currentUser);
            AuthResponse response = new AuthResponse(true, "Profile updated successfully");
            response.setUser(userService.convertToDto(saved));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, e.getMessage()));
        }
    }
}
