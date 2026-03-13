package com.brewco.service;

import com.brewco.config.RazorpayConfig;
import com.brewco.dto.PaymentResponse;
import com.brewco.entity.Order;
import com.brewco.entity.Payment;
import com.brewco.repository.OrderRepository;
import com.brewco.repository.PaymentRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Production-grade Payment Service handling all Razorpay operations.
 *
 * Key design decisions:
 *  - The Razorpay order is created for ₹1 (100 paise) in test mode,
 *    while the actual order amount is displayed in our UI.
 *  - Signature verification uses Razorpay's official HMAC-SHA256 utility.
 *  - All state transitions are atomic (within @Transactional boundaries).
 *  - Comprehensive logging for audit trail and debugging.
 */
@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    /** Minimum amount in paise that Razorpay accepts (₹1 = 100 paise). Demo charge. */
    private static final int DEMO_AMOUNT_PAISE = 100;

    @Autowired(required = false)
    private RazorpayClient razorpayClient;

    @Autowired
    private RazorpayConfig razorpayConfig;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    // ─────────────────────────────────────────────────────────────────────
    //  1. CREATE RAZORPAY ORDER
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Creates a Razorpay order and a corresponding Payment record in our DB.
     *
     * @param order The Brew & Co order to create payment for
     * @return PaymentResponse containing all data the frontend needs
     */
    @Transactional
    public PaymentResponse createRazorpayOrder(Order order) throws Exception {
        // Guard: Razorpay must be configured
        if (razorpayClient == null || !razorpayConfig.isConfigured()) {
            throw new IllegalStateException(
                    "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file.");
        }

        // Guard: Order must have a valid total
        if (order.getGrandTotal() == null || order.getGrandTotal().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Order total must be greater than zero.");
        }

        // Guard: Don't create duplicate payments for the same order
        List<Payment> existingPayments = paymentRepository.findByOrder(order);
        Optional<Payment> pendingPayment = existingPayments.stream()
                .filter(p -> "PENDING".equals(p.getStatus()))
                .findFirst();

        if (pendingPayment.isPresent()) {
            Payment existing = pendingPayment.get();
            log.info("Reusing existing pending payment [id={}] for order [id={}]",
                    existing.getId(), order.getId());

            return PaymentResponse.builder()
                    .razorpayOrderId(existing.getRazorpayOrderId())
                    .amount(DEMO_AMOUNT_PAISE)
                    .currency("INR")
                    .keyId(razorpayConfig.getKeyId())
                    .paymentId(existing.getId())
                    .displayAmount(order.getGrandTotal())
                    .orderRef(order.getOrderRef())
                    .cafeName(order.getCafe() != null ? order.getCafe().getName() : "Brew & Co")
                    .testMode(razorpayConfig.isTestMode())
                    .build();
        }

        // Create order on Razorpay servers
        log.info("Creating Razorpay order for Brew & Co order [id={}, ref={}, grandTotal=₹{}]",
                order.getId(), order.getOrderRef(), order.getGrandTotal());

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", DEMO_AMOUNT_PAISE);   // ₹1 in paise (demo/test charge)
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "brewco_" + order.getId());
        orderRequest.put("payment_capture", 1); // Auto-capture payment

        // Add notes for audit trail on Razorpay dashboard
        JSONObject notes = new JSONObject();
        notes.put("brewco_order_id", order.getId());
        notes.put("brewco_order_ref", order.getOrderRef());
        notes.put("actual_amount", order.getGrandTotal().toString());
        notes.put("mode", razorpayConfig.isTestMode() ? "TEST" : "LIVE");
        orderRequest.put("notes", notes);

        try {
            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);
            String razorpayOrderId = razorpayOrder.get("id");

            log.info("✓ Razorpay order created [razorpayOrderId={}, amount={} paise]",
                    razorpayOrderId, DEMO_AMOUNT_PAISE);

            // Persist Payment record
            Payment payment = new Payment();
            payment.setOrder(order);
            payment.setPaymentMethod("RAZORPAY");
            payment.setAmount(order.getGrandTotal()); // Store actual amount (for display)
            payment.setRazorpayOrderId(razorpayOrderId);
            payment.setStatus("PENDING");
            payment.setCurrency("INR");
            paymentRepository.save(payment);

            log.info("✓ Payment record created [paymentId={}, razorpayOrderId={}]",
                    payment.getId(), razorpayOrderId);

            return PaymentResponse.builder()
                    .razorpayOrderId(razorpayOrderId)
                    .amount(DEMO_AMOUNT_PAISE)
                    .currency("INR")
                    .keyId(razorpayConfig.getKeyId())
                    .paymentId(payment.getId())
                    .displayAmount(order.getGrandTotal())
                    .orderRef(order.getOrderRef())
                    .cafeName(order.getCafe() != null ? order.getCafe().getName() : "Brew & Co")
                    .testMode(razorpayConfig.isTestMode())
                    .build();

        } catch (RazorpayException e) {
            log.error("✗ Razorpay order creation failed for order [id={}]: {}", order.getId(), e.getMessage());
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage(), e);
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    //  2. VERIFY PAYMENT SIGNATURE
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Verifies the Razorpay payment signature and marks the payment as COMPLETED.
     * Uses Razorpay's HMAC-SHA256 verification utility.
     *
     * @param razorpayOrderId   The Razorpay order ID
     * @param razorpayPaymentId The Razorpay payment ID
     * @param razorpaySignature The HMAC-SHA256 signature
     * @param paymentId         Our internal payment record ID
     * @return The updated Payment entity
     */
    @Transactional
    public Payment verifyAndConfirmPayment(String razorpayOrderId, String razorpayPaymentId,
                                           String razorpaySignature, Long paymentId) throws Exception {
        log.info("Verifying payment [paymentId={}, razorpayOrderId={}, razorpayPaymentId={}]",
                paymentId, razorpayOrderId, razorpayPaymentId);

        // Step 1: Verify the HMAC-SHA256 signature
        JSONObject attributes = new JSONObject();
        attributes.put("razorpay_order_id", razorpayOrderId);
        attributes.put("razorpay_payment_id", razorpayPaymentId);
        attributes.put("razorpay_signature", razorpaySignature);

        try {
            Utils.verifyPaymentSignature(attributes, razorpayConfig.getKeySecret());
        } catch (RazorpayException e) {
            log.error("✗ Payment signature verification FAILED [paymentId={}]: {}", paymentId, e.getMessage());

            // Mark as failed in our DB
            Payment payment = paymentRepository.findById(paymentId).orElse(null);
            if (payment != null) {
                payment.setStatus("FAILED");
                paymentRepository.save(payment);
            }

            throw new SecurityException("Payment verification failed: invalid signature");
        }

        // Step 2: Signature valid — update Payment record
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment record not found [id=" + paymentId + "]"));

        // Idempotency: if already completed, return as-is
        if ("COMPLETED".equals(payment.getStatus())) {
            log.warn("Payment [id={}] already marked as COMPLETED. Returning existing record.", paymentId);
            return payment;
        }

        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setRazorpaySignature(razorpaySignature);
        payment.setStatus("COMPLETED");
        payment.setTransactionId(razorpayPaymentId);
        payment.setPaymentDate(LocalDateTime.now());
        paymentRepository.save(payment);

        log.info("✓ Payment VERIFIED and COMPLETED [paymentId={}, transactionId={}]",
                paymentId, razorpayPaymentId);

        // Step 3: Update the order's payment status
        Order order = payment.getOrder();
        order.setPaymentStatus("COMPLETED");
        orderRepository.save(order);

        log.info("✓ Order [id={}, ref={}] payment status updated to COMPLETED",
                order.getId(), order.getOrderRef());

        return payment;
    }

    // ─────────────────────────────────────────────────────────────────────
    //  3. HANDLE PAYMENT FAILURE
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Marks a payment as FAILED when the user cancels or an error occurs.
     *
     * @param paymentId Our internal payment ID
     * @param reason    Failure reason for logging
     */
    @Transactional
    public void markPaymentFailed(Long paymentId, String reason) {
        Payment payment = paymentRepository.findById(paymentId).orElse(null);
        if (payment == null) {
            log.warn("Cannot mark payment as failed — not found [id={}]", paymentId);
            return;
        }

        if ("COMPLETED".equals(payment.getStatus())) {
            log.warn("Payment [id={}] is already COMPLETED. Not marking as failed.", paymentId);
            return;
        }

        payment.setStatus("FAILED");
        paymentRepository.save(payment);

        Order order = payment.getOrder();
        order.setPaymentStatus("FAILED");
        orderRepository.save(order);

        log.info("✗ Payment marked FAILED [paymentId={}, reason={}]", paymentId, reason);
    }

    // ─────────────────────────────────────────────────────────────────────
    //  4. QUERY METHODS
    // ─────────────────────────────────────────────────────────────────────

    public List<Payment> getPaymentsForOrder(Order order) {
        return paymentRepository.findByOrder(order);
    }

    public Optional<Payment> getPaymentById(Long id) {
        return paymentRepository.findById(id);
    }

    /**
     * Get the latest payment status for an order.
     */
    public Optional<Payment> getLatestPaymentForOrder(Long orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) return Optional.empty();

        List<Payment> payments = paymentRepository.findByOrder(order);
        if (payments.isEmpty()) return Optional.empty();

        // Return most recent payment (last in list, since they're ordered by creation)
        return Optional.of(payments.get(payments.size() - 1));
    }

    // ─────────────────────────────────────────────────────────────────────
    //  5. LEGACY SUPPORT (for cash/counter payments)
    // ─────────────────────────────────────────────────────────────────────

    public Payment createPaymentRecord(Order order, String method, BigDecimal amount) {
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentMethod(method);
        payment.setAmount(amount);
        payment.setStatus("PENDING");
        return paymentRepository.save(payment);
    }

    public Payment confirmPayment(Payment payment, String transactionId) {
        payment.setStatus("COMPLETED");
        payment.setTransactionId(transactionId);
        payment.setPaymentDate(LocalDateTime.now());
        return paymentRepository.save(payment);
    }
}
