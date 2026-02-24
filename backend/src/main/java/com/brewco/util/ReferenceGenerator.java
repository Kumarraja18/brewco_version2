package com.brewco.util;

import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class ReferenceGenerator {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private final AtomicInteger counter = new AtomicInteger(1000);

    public String generateOrderReference() {
        return "ORD-" + LocalDate.now().format(DATE_FORMAT) + "-"
                + String.format("%04d", counter.incrementAndGet() % 10000);
    }

    public String generateBookingReference() {
        return "BKG-" + LocalDate.now().format(DATE_FORMAT) + "-"
                + String.format("%04d", counter.incrementAndGet() % 10000);
    }

    public String generatePaymentReference() {
        return "PAY-" + LocalDate.now().format(DATE_FORMAT) + "-"
                + String.format("%04d", counter.incrementAndGet() % 10000);
    }
}
