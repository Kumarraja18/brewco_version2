package com.brewco.controller;

import com.brewco.entity.Order;
import com.brewco.entity.Payment;
import com.brewco.entity.User;
import com.brewco.repository.OrderRepository;
import com.brewco.repository.PaymentRepository;
import com.brewco.repository.UserRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Value("${razorpay.key.id:}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:}")
    private String razorpayKeySecret;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * POST /api/payments/create-order
     * Creates a Razorpay order with amount = ₹0 (100 paise minimum for Razorpay).
     * The real order amount is shown on our website; Razorpay charges ₹1 in test mode
     * (no real money in test mode anyway).
     */
    @PostMapping("/create-order")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createRazorpayOrder(@RequestBody Map<String, Object> payload,
                                                  Authentication authentication) {
        try {
            if (razorpayKeyId == null || razorpayKeyId.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error",
                        "Razorpay keys not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env"));
            }

            Long orderId = Long.valueOf(payload.get("orderId").toString());
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new Exception("Order not found"));

            // Verify the order belongs to the logged-in customer
            User customer = userRepository.findByEmail(authentication.getName()).orElseThrow();
            if (!order.getCustomer().getId().equals(customer.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Not authorized to pay for this order"));
            }

            // Create Razorpay order — amount = 100 paise (₹1) for demo mode
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", 100); // ₹1 in paise (minimum allowed; demo mode)
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "brewco_order_" + orderId);

            com.razorpay.Order razorpayOrder = razorpay.orders.create(orderRequest);
            String razorpayOrderId = razorpayOrder.get("id");

            // Create Payment record in our DB
            Payment payment = new Payment();
            payment.setOrder(order);
            payment.setPaymentMethod("RAZORPAY");
            payment.setAmount(order.getGrandTotal());
            payment.setRazorpayOrderId(razorpayOrderId);
            payment.setStatus("PENDING");
            paymentRepository.save(payment);

            return ResponseEntity.ok(Map.of(
                    "razorpayOrderId", razorpayOrderId,
                    "amount", 100,
                    "currency", "INR",
                    "keyId", razorpayKeyId,
                    "paymentId", payment.getId()
            ));
        } catch (RazorpayException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Razorpay error: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/payments/verify
     * Verifies the Razorpay payment signature and marks payment + order as COMPLETED.
     */
    @PostMapping("/verify")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> payload) {
        try {
            String razorpayOrderId = payload.get("razorpay_order_id");
            String razorpayPaymentId = payload.get("razorpay_payment_id");
            String razorpaySignature = payload.get("razorpay_signature");
            Long paymentId = Long.valueOf(payload.get("payment_id"));

            // Verify Razorpay signature (throws RazorpayException if invalid)
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", razorpayOrderId);
            attributes.put("razorpay_payment_id", razorpayPaymentId);
            attributes.put("razorpay_signature", razorpaySignature);
            Utils.verifyPaymentSignature(attributes, razorpayKeySecret);

            // Signature valid — update Payment record
            Payment payment = paymentRepository.findById(paymentId)
                    .orElseThrow(() -> new Exception("Payment record not found"));
            payment.setRazorpayPaymentId(razorpayPaymentId);
            payment.setRazorpaySignature(razorpaySignature);
            payment.setStatus("COMPLETED");
            payment.setTransactionId(razorpayPaymentId);
            payment.setPaymentDate(LocalDateTime.now());
            paymentRepository.save(payment);

            // Update the order's payment status
            Order order = payment.getOrder();
            order.setPaymentStatus("COMPLETED");
            orderRepository.save(order);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Payment verified successfully",
                    "transactionId", razorpayPaymentId
            ));
        } catch (RazorpayException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Payment verification failed: invalid signature"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
