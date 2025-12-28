package com.example.flightservice.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reservation_audit")
@Data
public class ReservationAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "reservation_id", nullable = false)
    private Integer reservationId;

    @Column(name = "old_status", length = 30)
    private String oldStatus;

    @Column(name = "new_status", length = 30, nullable = false)
    private String newStatus;

    @Column(name = "changed_by", length = 100)
    private String changedBy = "SYSTEM";

    @Column(name = "change_reason", length = 255)
    private String changeReason;

    @CreationTimestamp
    @Column(name = "changed_at")
    private LocalDateTime changedAt;

    // Relation avec Reservation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", referencedColumnName = "id", insertable = false, updatable = false)
    private Reservation reservation;
}