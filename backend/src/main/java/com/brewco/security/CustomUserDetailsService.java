package com.brewco.security;

import com.brewco.entity.User;
import com.brewco.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Note: we fetch the passwordHash, not the plaintext password
        String password = user.getPasswordHash() != null ? user.getPasswordHash() : user.getPassword();
        if (password == null) {
            password = ""; // Prevents null pointer exception if user has no password yet
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                password,
                user.getIsActive(),
                true,
                true,
                true, // You can extend this for account non-locked, etc.
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase())));
    }
}
