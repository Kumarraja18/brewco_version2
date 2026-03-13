package com.brewco.controller;

import com.brewco.config.RazorpayConfig;
import com.brewco.dto.CreatePaymentRequest;
import com.brewco.dto.PaymentResponse;
import com.brewco.dto.VerifyPaymentRequest;
import com.brewco.entity.Order;
import com.brewco.entity.Payment;
import com.brewco.entity.User;
import com.brewco.repository.OrderRepository;
import com.brewco.repository.UserRepository;
import com.brewco.service.PaymentService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

/**
 * REST Controller for Razorpay Payment Integration.
 *
 * Endpoints:
 *   POST /api/payments/create-order   → Create a Razorpay order (initiates payment flow)
 *   POST /api/payments/verify         → Verify payment signature (completes payment flow)
 *   POST /api/payments/failure        → Record payment failure (user cancelled or error)
 *   GET  /api/payments/status/{id}    → Check payment status
 *   GET  /api/payments/config         → Get Razorpay public configuration for frontend
 *
 * Security: All endpoints require ROLE_CUSTOMER authentication.
 * All operations delegate to PaymentService for business logic.
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RazorpayConfig razorpayConfig;

    // ─────────────────────────────────────────────────────────────────────
    //  GET /api/payments/config — Public Razorpay config for frontend
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Returns public Razorpay configuration (key ID, test mode status).
     * The frontend needs the key ID to initialize the Razorpay checkout SDK.
     * The secret key is NEVER sent to the client.
     */
    @GetMapping("/config")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getPaymentConfig() {
        if (!razorpayConfig.isConfigured()) {
            return ResponseEntity.ok(Map.of(
                    "configured", false,
                    "message", "Razorpay is not configured. Online payments are unavailable."
            ));
        }

        return ResponseEntity.ok(Map.of(
                "configured", true,
                "keyId", razorpayConfig.getKeyId(),
                "testMode", razorpayConfig.isTestMode()
        ));
    }

    // ─────────────────────────────────────────────────────────────────────
    //  POST /api/payments/create-order — Create Razorpay Order
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Creates a Razorpay order for the given Brew & Co order.
     * 
     * In test/demo mode, Razorpay is charged ₹1 (100 paise), while
     * the full order amount is displayed in the frontend UI.
     * This gives a realistic payment flow without actual charges.
     */
    @PostMapping("/create-order")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createRazorpayOrder(@Valid @RequestBody CreatePaymentRequest request,
                                                  Authentication authentication) {
        try {
            // Validate Razorpay configuration
            if (!razorpayConfig.isConfigured()) {
                log.error("Payment attempt with unconfigured Razorpay keys");
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env"
                ));
            }

            // Fetch and validate the order
            Order order = orderRepository.findById(request.getOrderId())
                    .orElse(null);
            if (order == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Order not found"));
            }

            // Verify the order belongs to the authenticated customer
            User customer = userRepository.findByEmail(authentication.getName()).orElse(null);
            if (customer == null || !order.getCustomer().getId().equals(customer.getId())) {
                log.warn("Unauthorized payment attempt: user [{}] tried to pay for order [id={}]",
                        authentication.getName(), request.getOrderId());
                return ResponseEntity.status(403).body(Map.of(
                        "error", "Not authorized to pay for this order"
                ));
            }

            // Check if already paid
            if ("COMPLETED".equals(order.getPaymentStatus())) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "This order has already been paid",
                        "paymentStatus", "COMPLETED"
                ));
            }

            // Delegate to service
            PaymentResponse response = paymentService.createRazorpayOrder(order);

            log.info("Razorpay order created for customer [{}], order [id={}, ref={}]",
                    customer.getEmail(), order.getId(), order.getOrderRef());

            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            log.error("Configuration error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating Razorpay order: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to initiate payment. Please try again."
            ));
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    //  POST /api/payments/verify — Verify Payment Signature
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Verifies the Razorpay payment after the user completes checkout.
     * 
     * The Razorpay checkout SDK returns:
     *   - razorpay_order_id
     *   - razorpay_payment_id
     *   - razorpay_signature (HMAC-SHA256)
     * 
     * We verify this signature server-side using the Razorpay secret key.
     * If valid, the payment and order are marked as COMPLETED.
     */
    @PostMapping("/verify")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> verifyPayment(@Valid @RequestBody VerifyPaymentRequest request) {
        try {
            Payment payment = paymentService.verifyAndConfirmPayment(
                    request.getRazorpay_order_id(),
                    request.getRazorpay_payment_id(),
                    request.getRazorpay_signature(),
                    request.getPayment_id()
            );

            log.info("✓ Payment verified successfully [paymentId={}, transactionId={}]",
                    payment.getId(), payment.getTransactionId());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Payment verified successfully",
                    "transactionId", payment.getTransactionId(),
                    "paymentId", payment.getId(),
                    "orderId", payment.getOrder().getId(),
                    "status", "COMPLETED",
                    "paidAt", payment.getPaymentDate().toString()
            ));

        } catch (SecurityException e) {
            log.error("✗ Payment verification FAILED — signature mismatch: {}", e.getMessage());
            return ResponseEntity.status(400).body(Map.of(
                    "success", false,
                    "error", "Payment verification failed: invalid signature",
                    "code", "SIGNATURE_MISMATCH"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("✗ Unexpected error during payment verification: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "error", "Payment verification failed. Please contact support."
            ));
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    //  POST /api/payments/failure — Record Payment Failure
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Records a payment failure when the user dismisses the checkout
     * or an error occurs on the client side.
     */
    @PostMapping("/failure")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> recordPaymentFailure(@RequestBody Map<String, Object> payload) {
        try {
            Long paymentId = payload.get("payment_id") != null
                    ? Long.valueOf(payload.get("payment_id").toString())
                    : null;
            String reason = payload.get("reason") != null
                    ? payload.get("reason").toString()
                    : "User cancelled or checkout error";

            if (paymentId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "payment_id is required"));
            }

            paymentService.markPaymentFailed(paymentId, reason);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Payment failure recorded"
            ));
        } catch (Exception e) {
            log.error("Error recording payment failure: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    //  GET /api/payments/status/{orderId} — Payment Status Check
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Returns the latest payment status for a given order.
     * Useful for the frontend to poll status after a payment attempt.
     */
    @GetMapping("/status/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getPaymentStatus(@PathVariable Long orderId, Authentication authentication) {
        try {
            // Verify order belongs to the customer
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order == null) {
                return ResponseEntity.notFound().build();
            }

            User customer = userRepository.findByEmail(authentication.getName()).orElse(null);
            if (customer == null || !order.getCustomer().getId().equals(customer.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Not authorized"));
            }

            Optional<Payment> latestPayment = paymentService.getLatestPaymentForOrder(orderId);
            if (latestPayment.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                        "orderId", orderId,
                        "paymentStatus", order.getPaymentStatus(),
                        "hasPayment", false
                ));
            }

            Payment payment = latestPayment.get();
            return ResponseEntity.ok(Map.of(
                    "orderId", orderId,
                    "paymentId", payment.getId(),
                    "paymentStatus", payment.getStatus(),
                    "paymentMethod", payment.getPaymentMethod(),
                    "amount", payment.getAmount(),
                    "transactionId", payment.getTransactionId() != null ? payment.getTransactionId() : "",
                    "paidAt", payment.getPaymentDate() != null ? payment.getPaymentDate().toString() : "",
                    "hasPayment", true
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
