package com.brewco.repository;

import com.brewco.entity.EmailVerification;
import com.brewco.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
    Optional<EmailVerification> findByUser(User user);

    Optional<EmailVerification> findByUserAndOtp(User user, String otp);

    @Modifying
    @Transactional
    void deleteByUser(User user);
}
