package com.brewco.security;

import com.brewco.exception.RateLimitException;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final Map<String, Bucket> loginBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> registerBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> otpBuckets = new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String uri = request.getRequestURI();
        String ip = getClientIP(request);

        if (uri.equals("/api/auth/login")) {
            Bucket bucket = loginBuckets.computeIfAbsent(ip, k -> createLoginBucket());
            if (!bucket.tryConsume(1)) {
                throw new RateLimitException("Too many login attempts. Try again in 15 minutes.");
            }
        } else if (uri.startsWith("/api/auth/register")) {
            Bucket bucket = registerBuckets.computeIfAbsent(ip, k -> createRegisterBucket());
            if (!bucket.tryConsume(1)) {
                throw new RateLimitException("Too many registration attempts. Try again in 1 hour.");
            }
        } else if (uri.equals("/api/auth/send-otp") || uri.equals("/api/auth/resend-otp")) {
            // For OTP, we might limit by email, but IP is also good for brute force
            Bucket bucket = otpBuckets.computeIfAbsent(ip, k -> createOtpBucket());
            if (!bucket.tryConsume(1)) {
                throw new RateLimitException("Too many OTP requests. Try again in 10 minutes.");
            }
        }

        return true;
    }

    private Bucket createLoginBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(15))))
                .build();
    }

    private Bucket createRegisterBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(10, Refill.intervally(10, Duration.ofHours(1))))
                .build();
    }

    private Bucket createOtpBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(3, Refill.intervally(3, Duration.ofMinutes(10))))
                .build();
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
