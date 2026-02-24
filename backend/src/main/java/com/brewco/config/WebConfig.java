package com.brewco.config;

// import com.brewco.security.RateLimitInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // Rate limiting temporarily disabled
    // private final RateLimitInterceptor rateLimitInterceptor;

    // public WebConfig(RateLimitInterceptor rateLimitInterceptor) {
    // this.rateLimitInterceptor = rateLimitInterceptor;
    // }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Rate limiting disabled — re-enable by uncommenting above and below
        // registry.addInterceptor(rateLimitInterceptor)
        // .addPathPatterns("/api/auth/login", "/api/auth/register/**",
        // "/api/auth/send-otp", "/api/auth/resend-otp");
    }
}
