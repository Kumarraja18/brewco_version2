package com.brewco.config;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Razorpay Payment Gateway Configuration.
 * 
 * Initializes a singleton RazorpayClient bean from environment-sourced credentials.
 * Keys must NEVER be hardcoded — they come from application.properties → .env file.
 * 
 * Test mode keys (rzp_test_*) ensure no real money is ever charged.
 */
@Configuration
public class RazorpayConfig {

    private static final Logger log = LoggerFactory.getLogger(RazorpayConfig.class);

    @Value("${razorpay.key.id:}")
    private String keyId;

    @Value("${razorpay.key.secret:}")
    private String keySecret;

    @Bean
    public RazorpayClient razorpayClient() throws RazorpayException {
        if (keyId == null || keyId.isBlank() || keySecret == null || keySecret.isBlank()) {
            log.warn("⚠ Razorpay keys not configured. Payment features will be disabled. " +
                     "Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.");
            return null;
        }

        boolean isTestMode = keyId.startsWith("rzp_test_");
        log.info("✓ Razorpay client initialized in {} mode", isTestMode ? "TEST" : "LIVE");

        if (!isTestMode) {
            log.warn("⚠ LIVE Razorpay keys detected! Real charges will be applied. " +
                     "Ensure this is intentional for a production deployment.");
        }

        return new RazorpayClient(keyId, keySecret);
    }

    public String getKeyId() {
        return keyId;
    }

    public String getKeySecret() {
        return keySecret;
    }

    public boolean isConfigured() {
        return keyId != null && !keyId.isBlank() && keySecret != null && !keySecret.isBlank();
    }

    public boolean isTestMode() {
        return keyId != null && keyId.startsWith("rzp_test_");
    }
}
