package com.brewco.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "cafe_tables")
@Data
public class CafeTable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cafe_id", nullable = false)
    @JsonIgnore
    private Cafe cafe;

    @Column(name = "table_number", nullable = false)
    private Integer tableNumber;

    @Column(name = "table_type", nullable = false)
    private String tableType = "STANDARD"; // ECONOMY, STANDARD, PREMIUM, EXCLUSIVE

    @Column(nullable = false)
    private Integer capacity; // 2, 4, 6, etc.

    @Column(name = "display_label")
    private String displayLabel; // e.g. "Cozy Duo", "Family Booth", "VIP Lounge"

    @Column
    private String description;

    @Column(nullable = false)
    private String status = "AVAILABLE"; // AVAILABLE, BOOKED, OCCUPIED

    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;

    @Column(name = "qr_code")
    private String qrCode;
}
