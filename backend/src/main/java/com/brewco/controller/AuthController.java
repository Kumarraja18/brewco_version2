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
import jakarta.servlet.http.Cookie;
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

            Cookie cookie = new Cookie("access_token", jwt);
            cookie.setHttpOnly(true);
            cookie.setSecure(false); // In production with HTTPS, change this to true
            cookie.setPath("/");
            cookie.setMaxAge(15 * 60); // 15 mins expiry matching the token lifespan
            servletResponse.addCookie(cookie);

            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
            Cookie refreshCookie = new Cookie("refresh_token", refreshToken.getToken());
            refreshCookie.setHttpOnly(true);
            refreshCookie.setSecure(false);
            refreshCookie.setPath("/api/auth/refresh");
            refreshCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
            servletResponse.addCookie(refreshCookie);

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
            Cookie cookie = new Cookie("access_token", jwt);
            cookie.setHttpOnly(true);
            cookie.setSecure(false);
            cookie.setPath("/");
            cookie.setMaxAge(15 * 60);
            servletResponse.addCookie(cookie);

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

        Cookie getCookie = new Cookie("access_token", null);
        getCookie.setMaxAge(0);
        getCookie.setPath("/");
        getCookie.setHttpOnly(true);
        response.addCookie(getCookie);

        Cookie refreshCookie = new Cookie("refresh_token", null);
        refreshCookie.setMaxAge(0);
        refreshCookie.setPath("/api/auth/refresh");
        refreshCookie.setHttpOnly(true);
        response.addCookie(refreshCookie);

        return ResponseEntity.ok(new AuthResponse(true, "Logged out successfully"));
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
