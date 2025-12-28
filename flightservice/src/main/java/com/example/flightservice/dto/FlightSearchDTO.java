package com.example.flightservice.dto;

import com.example.flightservice.model.ClassType;
import com.example.flightservice.model.FlightStatus;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class FlightSearchDTO {
    private String id;
    private String flightNumber;
    private String airline;
    private String departureCity;
    private String departureCode;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private Integer duration;
    private FlightStatus status;
    private String aircraftType;
    private List<FlightClassInfo> classes;
    private Double minPrice; // Prix minimum disponible parmi toutes les classes (basePrice + classPrice)
    private Double basePrice; // Prix de base depuis flights.price
    private Integer totalAvailableSeats; // Somme des places disponibles de toutes les classes

    @Data
    public static class FlightClassInfo {
        private Integer id;
        private ClassType classType;
        private Integer availableSeats;
        private Double classPrice; // Supplément de classe depuis flight_class.class_price
        private Double totalPrice; // Prix total = basePrice + classPrice
        private String currency;

        // Méthode utilitaire pour afficher les détails du prix
        @Override
        public String toString() {
            return String.format("FlightClassInfo{classType=%s, availableSeats=%d, classPrice=%.2f, totalPrice=%.2f, currency='%s'}",
                    classType, availableSeats, classPrice != null ? classPrice : 0.0,
                    totalPrice != null ? totalPrice : 0.0, currency);
        }
    }

    // Méthode utilitaire pour obtenir le prix d'une classe spécifique
    public Double getPriceForClass(ClassType classType) {
        if (classes == null) {
            return basePrice != null ? basePrice : 0.0;
        }

        for (FlightClassInfo classInfo : classes) {
            if (classInfo.getClassType() == classType && classInfo.getTotalPrice() != null) {
                return classInfo.getTotalPrice();
            }
        }

        // Si la classe n'est pas trouvée, retourner le prix de base
        return basePrice != null ? basePrice : 0.0;
    }

    // Méthode pour obtenir le supplément d'une classe spécifique
    public Double getClassSupplement(ClassType classType) {
        if (classes == null) {
            return 0.0;
        }

        for (FlightClassInfo classInfo : classes) {
            if (classInfo.getClassType() == classType && classInfo.getClassPrice() != null) {
                return classInfo.getClassPrice();
            }
        }

        return 0.0;
    }

    // Méthode pour vérifier si une classe a des places disponibles
    public boolean isClassAvailable(ClassType classType) {
        if (classes == null) {
            return false;
        }

        for (FlightClassInfo classInfo : classes) {
            if (classInfo.getClassType() == classType) {
                return classInfo.getAvailableSeats() != null && classInfo.getAvailableSeats() > 0;
            }
        }

        return false;
    }

    // Méthode pour obtenir les places disponibles d'une classe
    public Integer getAvailableSeatsForClass(ClassType classType) {
        if (classes == null) {
            return 0;
        }

        for (FlightClassInfo classInfo : classes) {
            if (classInfo.getClassType() == classType && classInfo.getAvailableSeats() != null) {
                return classInfo.getAvailableSeats();
            }
        }

        return 0;
    }

    @Override
    public String toString() {
        return String.format("FlightSearchDTO{id='%s', flightNumber='%s', airline='%s', departureCity='%s', " +
                        "basePrice=%.2f, minPrice=%.2f, classes=%d, totalAvailableSeats=%d}",
                id, flightNumber, airline, departureCity,
                basePrice != null ? basePrice : 0.0,
                minPrice != null ? minPrice : 0.0,
                classes != null ? classes.size() : 0,
                totalAvailableSeats != null ? totalAvailableSeats : 0);
    }
}