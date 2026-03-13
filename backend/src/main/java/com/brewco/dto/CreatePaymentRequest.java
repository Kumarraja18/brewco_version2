package com.brewco.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request DTO for initiating a Razorpay payment order.
 */
@Data
public class CreatePaymentRequest {

    @NotNull(message = "orderId is required")
    private Long orderId;
}
