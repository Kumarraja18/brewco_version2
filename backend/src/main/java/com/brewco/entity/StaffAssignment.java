package com.brewco.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "staff_assignments")
@Data
public class StaffAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cafe_id", nullable = false)
    @JsonIgnoreProperties({"owner", "documents", "menuCategories", "menuItems", "tables", "orders", "bookings", "staffAssignments", "hibernateLazyInitializer", "handler"})
    private Cafe cafe;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "passwordHash", "ownedCafes", "governmentProof", "workExperiences", "orders", "bookings", "staffAssignments", "assignedOrders", "waitedOrders", "hibernateLazyInitializer", "handler"})
    private User staff;

    @Column(name = "assigned_role", nullable = false)
    private String role; // CHEF, WAITER

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_by")
    @JsonIgnoreProperties({"password", "passwordHash", "ownedCafes", "governmentProof", "workExperiences", "orders", "bookings", "staffAssignments", "assignedOrders", "waitedOrders", "hibernateLazyInitializer", "handler"})
    private User assignedBy;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "assigned_at", nullable = false, updatable = false)
    private LocalDateTime assignedAt;

    @PrePersist
    protected void onAssign() {
        assignedAt = LocalDateTime.now();
    }
}
