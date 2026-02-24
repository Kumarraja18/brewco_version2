package com.brewco.service;

import com.brewco.entity.RefreshToken;
import com.brewco.entity.User;
import com.brewco.repository.RefreshTokenRepository;
import com.brewco.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class RefreshTokenService {

    @Value("${jwt.refresh-token-expiry}")
    private Long refreshTokenDurationMs;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    public RefreshToken createRefreshToken(Long userId) throws Exception {
        User user = userRepository.findById(userId).orElseThrow(() -> new Exception("User not found"));

        // Fetch existing token or create a new one to avoid Unique Constraint violation
        RefreshToken refreshToken = refreshTokenRepository.findByUser(user).orElse(new RefreshToken());

        refreshToken.setUser(user);
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setIsRevoked(false);

        return refreshTokenRepository.save(refreshToken);
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public RefreshToken verifyExpiration(RefreshToken token) throws Exception {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new Exception("Refresh token was expired. Please make a new signin request");
        }
        return token;
    }

    public int deleteByUserId(Long userId) throws Exception {
        User user = userRepository.findById(userId).orElseThrow(() -> new Exception("User not found"));
        return refreshTokenRepository.deleteByUser(user);
    }
}
