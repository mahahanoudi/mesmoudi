package com.example.flightservice.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reservation")
@Data
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "flight_id", nullable = false)
    private String flightId;

    @Column(name = "passengers_count", nullable = false)
    private Integer passengersCount;

    @Column(name = "total_price", nullable = false)
    private Double totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ReservationStatus status = ReservationStatus.PENDING;

    @CreationTimestamp
    @Column(name = "reservation_date", updatable = false)
    private LocalDateTime reservationDate;

    @Column(name = "confirmation_code", unique = true)
    private String confirmationCode;

    // Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flight_id", referencedColumnName = "id", insertable = false, updatable = false)
    private Flight flight;

    @ManyToOne
    @JoinColumn(name = "flight_class_id", insertable = false, updatable = false)
    private FlightClass flightClass;

    @Column(name = "flight_class_id")
    private Integer flightClassId;


    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PassengerDetail> passengerDetails = new ArrayList<>();

    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ReservationAudit> auditLogs = new ArrayList<>();

    // Méthode pour générer un code de confirmation
    public void generateConfirmationCode() {
        this.confirmationCode = "RES" +
                String.format("%06d", this.id) +
                String.valueOf(System.currentTimeMillis()).substring(8);
    }
}