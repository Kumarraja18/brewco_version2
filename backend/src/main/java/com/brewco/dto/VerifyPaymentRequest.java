package com.brewco.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request DTO for verifying a Razorpay payment after checkout completion.
 * Contains the three Razorpay parameters returned by the checkout handler.
 */
@Data
public class VerifyPaymentRequest {

    @NotBlank(message = "razorpay_order_id is required")
    private String razorpay_order_id;

    @NotBlank(message = "razorpay_payment_id is required")
    private String razorpay_payment_id;

    @NotBlank(message = "razorpay_signature is required")
    private String razorpay_signature;

    @NotNull(message = "payment_id is required")
    private Long payment_id;
}
