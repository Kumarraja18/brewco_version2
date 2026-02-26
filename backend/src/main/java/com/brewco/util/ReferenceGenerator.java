package com.brewco.util;

import org.springframework.stereotype.Component;
import java.time.format.DateTimeFormatter;

@Component
public class ReferenceGenerator {

    private static final DateTimeFormatter FULL_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    public String generateOrderReference() {
        return "ORD-" + java.time.LocalDateTime.now().format(FULL_TIME_FORMAT) + "-"
                + String.format("%03d", new java.util.Random().nextInt(1000));
    }

    public String generateBookingReference() {
        return "BKG-" + java.time.LocalDateTime.now().format(FULL_TIME_FORMAT) + "-"
                + String.format("%03d", new java.util.Random().nextInt(1000));
    }

    public String generatePaymentReference() {
        return "PAY-" + java.time.LocalDateTime.now().format(FULL_TIME_FORMAT) + "-"
                + String.format("%03d", new java.util.Random().nextInt(1000));
    }
}
