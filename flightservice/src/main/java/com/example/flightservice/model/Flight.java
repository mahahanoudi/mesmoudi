package com.example.flightservice.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "flights")
@Data
public class Flight {

    @Id
    private String id;

    @Column(name = "flight_number", nullable = false)
    private String flightNumber;

    @Column(nullable = false)
    private String airline;

    @Column(name = "departure_city", nullable = false)
    private String departureCity;

    @Column(name = "departure_airport")
    private String departureAirport;

    @Column(name = "departure_code", nullable = false)
    private String departureCode;

    @Column(name = "departure_time", nullable = false)
    private LocalDateTime departureTime;

    @Column(name = "arrival_city", nullable = false)
    private String arrivalCity = "Tétouan";

    @Column(name = "arrival_airport")
    private String arrivalAirport = "Aéroport Sania Ramel";

    @Column(name = "arrival_code", nullable = false)
    private String arrivalCode = "TTU";

    @Column(name = "arrival_time", nullable = false)
    private LocalDateTime arrivalTime;

    // CORRECTION: Utiliser 'price' de la BD (pas base_price)
    @Column(name = "price", nullable = false)
    private Double price;

    @Column(nullable = false)
    private String currency = "MAD";

    @Column(name = "available_seats")
    private Integer availableSeats;

    @Enumerated(EnumType.STRING)
    private FlightStatus status = FlightStatus.SCHEDULED;

    private Integer duration; // en minutes

    @Column(name = "aircraft_type")
    private String aircraftType;

    private String terminal;
    private String gate;

    @Column(name = "data_source")
    private String dataSource = "SYSTEM";

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @Column(name = "base_price")
    private Double basePrice; // Gardé pour compatibilité mais vide dans votre BD

    // Méthode pour obtenir le prix principal
    @Transient
    public Double getBasePrice() {
        return this.price; // Retourner price comme basePrice pour le DTO
    }

    @Transient
    public void setBasePrice(Double basePrice) {
        this.price = basePrice;
    }
}