package com.brewco.util;

import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

@Component
public class ReferenceGenerator {

    private static final DateTimeFormatter TIMESTAMP_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private final Random random = new Random();

    public String generateOrderReference() {
        return "ORD-" + LocalDateTime.now().format(TIMESTAMP_FORMAT) + "-" + String.format("%03d", random.nextInt(1000));
    }

    public String generateBookingReference() {
        return "BKG-" + LocalDateTime.now().format(TIMESTAMP_FORMAT) + "-" + String.format("%03d", random.nextInt(1000));
    }

    public String generatePaymentReference() {
        return "PAY-" + LocalDateTime.now().format(TIMESTAMP_FORMAT) + "-" + String.format("%03d", random.nextInt(1000));
    }
}
