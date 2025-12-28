package com.example.flightservice.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "flight_class")
@Data
public class FlightClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "flight_id", nullable = false)
    private String flightId;

    @Enumerated(EnumType.STRING)
    @Column(name = "class_type", nullable = false)
    private ClassType classType;

    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats;

    @Column(name = "available_seats", nullable = false)
    private Integer availableSeats;

    @Column(name = "class_price", nullable = false)
    private Double classPrice;

    @Column(name = "currency", length = 10)
    private String currency = "MAD";

    // Relation avec Flight
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flight_id", referencedColumnName = "id", insertable = false, updatable = false)
    private Flight flight;
}