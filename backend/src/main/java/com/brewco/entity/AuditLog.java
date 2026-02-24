package com.brewco.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id") // Nullable if system action or unauthenticated
    private User user;

    @Column(nullable = false)
    private String action; // e.g., CREATE_ORDER, VERIFY_CAFE, CANCEL_BOOKING

    @Column(name = "entity_name")
    private String entityName; // e.g., Order, Cafe, Booking

    @Column(name = "entity_id")
    private Long entityId;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @Column(name = "ip_address")
    private String ipAddress;

    @PrePersist
    protected void onLog() {
        timestamp = LocalDateTime.now();
    }
}
