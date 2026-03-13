package com.brewco.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Response DTO returned after creating a Razorpay order.
 * Contains all data the frontend needs to open the Razorpay checkout modal.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private String razorpayOrderId;
    private int amount;           // Amount in paise (sent to Razorpay checkout)
    private String currency;
    private String keyId;         // Public Razorpay key for frontend SDK
    private Long paymentId;       // Our internal payment record ID
    private BigDecimal displayAmount; // Actual order amount shown in UI
    private String orderRef;
    private String cafeName;
    private boolean testMode;
}
