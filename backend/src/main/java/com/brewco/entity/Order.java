package com.brewco.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders") // Prevent SQL reserved keyword issues
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_ref", unique = true, updatable = false)
    private String orderRef;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cafe_id", nullable = false)
    private Cafe cafe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_id")
    private CafeTable table; // Nullable for takeaway

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_chef_id")
    private User assignedChef;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_waiter_id")
    private User assignedWaiter;

    @Column(name = "order_type", nullable = false)
    private String orderType; // DINE_IN, TAKEAWAY, DELIVERY (DELIVERY: code ready, not exposed in UI yet)

    @Column(nullable = false)
    private String status = "PLACED"; // PLACED, CONFIRMED, PREPARING, READY, DELIVERED, CANCELLED

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "grand_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal grandTotal = BigDecimal.ZERO;

    @Column(name = "payment_status", nullable = false)
    private String paymentStatus = "PENDING"; // PENDING, COMPLETED, FAILED

    @Column(name = "estimated_ready_time")
    private LocalDateTime estimatedReadyTime;

    @Column(name = "special_instructions", columnDefinition = "TEXT")
    private String specialInstructions;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
