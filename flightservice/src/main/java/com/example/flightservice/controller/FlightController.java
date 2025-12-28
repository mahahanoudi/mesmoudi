package com.example.flightservice.controller;

import com.example.flightservice.dto.FlightSearchDTO;
import com.example.flightservice.model.*;
import com.example.flightservice.repository.FlightClassRepository; // AJOUTER CET IMPORT
import com.example.flightservice.service.FlightService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/flights")
@RequiredArgsConstructor
@Slf4j
public class FlightController {

    private final FlightService flightService;
    private final FlightClassRepository flightClassRepository; // AJOUTER CE CHAMP

    @GetMapping("/test")
    public ResponseEntity<String> testAPI() {
        return ResponseEntity.ok("✅ Flight Service Tétouan - Données depuis MySQL");
    }

    @GetMapping("/search")
    public ResponseEntity<List<FlightSearchDTO>> searchFlights(
            @RequestParam(required = false) String departureCity,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate departureDate,
            @RequestParam(required = false) String airline) {

        log.info("📡 GET /search - Ville: {}, Date: {}, Compagnie: {}",
                departureCity, departureDate, airline);

        List<FlightSearchDTO> flights = flightService.searchFlights(
                departureCity, departureDate, airline, null, null);

        log.info("📊 {} vols retournés depuis BD", flights.size());
        return ResponseEntity.ok(flights);
    }

    @GetMapping("/today")
    public ResponseEntity<List<FlightSearchDTO>> getTodayFlights() {

        log.info("📅 GET /today - Vols d'aujourd'hui depuis BD");

        List<FlightSearchDTO> flights = flightService.getTodayFlights(null, null);

        log.info("📊 {} vols d'aujourd'hui retournés", flights.size());
        return ResponseEntity.ok(flights);
    }

    @GetMapping("/{flightId}")
    public ResponseEntity<FlightSearchDTO> getFlightDetails(
            @PathVariable String flightId) {

        log.info("🔎 GET /{} - Détails du vol depuis BD", flightId);

        FlightSearchDTO flight = flightService.getFlightDetails(flightId, null);
        return ResponseEntity.ok(flight);
    }

    @GetMapping("/stats/db")
    public ResponseEntity<Map<String, Object>> getDatabaseStats() {
        log.info("📊 GET /stats/db - Statistiques BD");

        Map<String, Object> stats = new HashMap<>();

        try {
            Map<String, Object> dashboardStats = flightService.getDashboardStats();
            stats.put("status", "SUCCESS");
            stats.putAll(dashboardStats);
            stats.put("timestamp", LocalDateTime.now().toString());
            stats.put("currentDate", LocalDate.now().toString());

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            log.error("Erreur statistiques BD: {}", e.getMessage(), e);
            stats.put("status", "ERROR");
            stats.put("error", e.getMessage());
            return ResponseEntity.status(500).body(stats);
        }
    }

    @GetMapping("/cities/list")
    public ResponseEntity<List<String>> getCitiesList() {
        log.info("🏙️ GET /cities/list - Liste des villes depuis BD");

        try {
            List<String> cities = flightService.getAllDepartureCities();
            log.info("✅ {} villes retournées depuis BD", cities.size());
            return ResponseEntity.ok(cities);

        } catch (Exception e) {
            log.error("Erreur liste villes: {}", e.getMessage());
            return ResponseEntity.ok(Arrays.asList(
                    "Paris", "Casablanca", "Rabat", "Tanger", "Fès",
                    "Madrid", "Barcelone", "Lisbonne", "Londres", "Rome"
            ));
        }
    }

    @GetMapping("/airlines/list")
    public ResponseEntity<List<String>> getAirlinesList() {
        log.info("✈️ GET /airlines/list - Liste des compagnies depuis BD");

        try {
            List<String> airlines = flightService.getAllAirlines();
            log.info("✅ {} compagnies retournées depuis BD", airlines.size());
            return ResponseEntity.ok(airlines);

        } catch (Exception e) {
            log.error("Erreur liste compagnies: {}", e.getMessage());
            return ResponseEntity.ok(Arrays.asList(
                    "Royal Air Maroc", "Air France", "Iberia", "Lufthansa",
                    "British Airways", "Ryanair", "Air Arabia Maroc"
            ));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "Flight Service (MySQL)");
        health.put("version", "1.0.0");
        health.put("timestamp", LocalDateTime.now().toString());
        health.put("currentDate", LocalDate.now().toString());
        health.put("database", "MySQL - Données réelles");

        return ResponseEntity.ok(health);
    }

    @PostMapping("/initialize")
    public ResponseEntity<Map<String, String>> initializeDatabase() {
        log.info("🚀 Vérification de la base de données");

        Map<String, String> response = new HashMap<>();
        try {
            flightService.initializeDatabase();
            response.put("status", "SUCCESS");
            response.put("message", "Base de données vérifiée");
            response.put("currentDate", LocalDate.now().toString());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erreur vérification: {}", e.getMessage(), e);
            response.put("status", "ERROR");
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/reserve")
    public ResponseEntity<Map<String, String>> makeReservation(@RequestBody ReservationRequest request) {
        log.info("🎫 POST /reserve - Réservation: {}", request);

        Map<String, String> response = new HashMap<>();
        try {
            flightService.makeReservation(
                    request.getFlightId(),
                    request.getFlightClassId(),
                    request.getUserId(),
                    request.getPassengers()
            );

            response.put("status", "SUCCESS");
            response.put("message", "Réservation confirmée avec succès");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erreur réservation: {}", e.getMessage());
            response.put("status", "ERROR");
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/{flightId}/availability")
    public ResponseEntity<Map<String, Object>> checkAvailability(
            @PathVariable String flightId,
            @RequestParam ClassType classType,
            @RequestParam Integer passengers) {

        log.info("🔍 GET /{}/availability - Classe: {}, Passagers: {}", flightId, classType, passengers);

        Map<String, Object> response = new HashMap<>();

        try {
            FlightClass flightClass = flightClassRepository.findByFlightIdAndClassType(flightId, classType);

            if (flightClass == null) {
                response.put("available", false);
                response.put("message", "Classe non disponible");
                return ResponseEntity.ok(response);
            }

            boolean isAvailable = flightClass.getAvailableSeats() >= passengers;
            response.put("available", isAvailable);
            response.put("availableSeats", flightClass.getAvailableSeats());
            response.put("classPrice", flightClass.getClassPrice());

            if (!isAvailable) {
                response.put("message", "Seulement " + flightClass.getAvailableSeats() + " place(s) disponible(s)");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erreur vérification disponibilité: {}", e.getMessage());
            response.put("available", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Data
    static class ReservationRequest {
        private String flightId;
        private Integer flightClassId;
        private String userId;
        private Integer passengers;
    }
}