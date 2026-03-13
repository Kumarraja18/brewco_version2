package com.brewco.repository;

import com.brewco.entity.Order;
import com.brewco.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    /** Find all payments for a specific order. */
    List<Payment> findByOrder(Order order);

    /** Find all payments by Razorpay order ID. */
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    /** Find all payments by Razorpay payment ID. */
    Optional<Payment> findByRazorpayPaymentId(String razorpayPaymentId);

    /** Find all payments by status. */
    List<Payment> findByStatus(String status);

    /** Find payments for an order with a specific status. */
    List<Payment> findByOrderAndStatus(Order order, String status);
}
