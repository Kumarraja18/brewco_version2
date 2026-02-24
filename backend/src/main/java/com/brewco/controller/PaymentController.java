package com.brewco.controller;

import com.brewco.entity.Order;
import com.brewco.entity.Payment;
import com.brewco.entity.User;
import com.brewco.repository.UserRepository;
import com.brewco.service.OrderService;
import com.brewco.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

// @RestController  — UNCOMMENT when Razorpay integration is complete (Phase 10)
// @RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/initiate")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> initiatePayment(@RequestBody Map<String, Object> payload, Authentication authentication) {
        try {
            Long orderId = Long.valueOf(payload.get("orderId").toString());
            String method = payload.get("paymentMethod").toString();

            Order order = orderService.getOrderById(orderId)
                    .orElseThrow(() -> new Exception("Order not found"));

            // Ensure order belongs to user
            User customer = userRepository.findByEmail(authentication.getName()).orElseThrow();
            if (!order.getCustomer().getId().equals(customer.getId())) {
                return ResponseEntity.status(403).body("Not authorized to pay for this order");
            }

            Payment payment = paymentService.createPaymentRecord(order, method, order.getGrandTotal());
            // Here you would integrate with Razorpay and return the razorpay order ID.
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/confirm")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> confirmPayment(@RequestBody Map<String, Object> payload) {
        try {
            Long paymentId = Long.valueOf(payload.get("paymentId").toString());
            String transactionId = (String) payload.get("transactionId");
            // Assuming verification was successful
            // Payment payment = paymentService.confirmPayment(...)
            // return ok
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
