package com.brewco.service;

import com.brewco.entity.Order;
import com.brewco.entity.Payment;
import com.brewco.repository.PaymentRepository;
import com.brewco.util.ReferenceGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ReferenceGenerator referenceGenerator;

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
        payment.setTransactionId(transactionId != null ? transactionId : referenceGenerator.generatePaymentReference());
        payment.setPaymentDate(LocalDateTime.now());
        return paymentRepository.save(payment);
    }

    public List<Payment> getPaymentsForOrder(Order order) {
        return paymentRepository.findByOrder(order);
    }
}
