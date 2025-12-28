package com.example.flightservice.controller;

import com.example.flightservice.dto.ReservationDTO;
import com.example.flightservice.model.Reservation;
import com.example.flightservice.service.ReservationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@Slf4j
public class ReservationController {

    private final ReservationService reservationService;

    /**
     * Créer une réservation (statut PENDING)
     */
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createReservation(@RequestBody ReservationDTO reservationDTO) {
        log.info("📝 POST /create - Réservation pour user: {}", reservationDTO.getUserId());

        try {
            // Vérifier que l'utilisateur est connecté
            if (reservationDTO.getUserId() == null || reservationDTO.getUserId().isEmpty()) {
                return ResponseEntity.status(401)
                        .body(Map.of(
                                "status", "ERROR",
                                "message", "Utilisateur non connecté",
                                "requiresLogin", true
                        ));
            }

            Reservation reservation = reservationService.createReservation(reservationDTO);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "SUCCESS");
            response.put("message", "Réservation créée avec succès");
            response.put("reservationId", reservation.getId());
            response.put("confirmationCode", reservation.getConfirmationCode());
            response.put("status", reservation.getStatus().name());
            response.put("totalPrice", reservation.getTotalPrice());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("❌ Erreur création réservation: {}", e.getMessage());

            Map<String, Object> response = new HashMap<>();
            response.put("status", "ERROR");
            response.put("message", e.getMessage());

            // Spécial pour l'authentification
            if (e.getMessage().contains("non connecté")) {
                response.put("requiresLogin", true);
                return ResponseEntity.status(401).body(response);
            }

            return ResponseEntity.status(400).body(response);
        }
    }

    /**
     * Confirmer une réservation et mettre à jour les places
     */
    @PostMapping("/confirm/{reservationId}")
    public ResponseEntity<Map<String, String>> confirmReservation(
            @PathVariable Integer reservationId,
            @RequestHeader("X-User-Id") String userId) {

        log.info("✅ POST /confirm/{} - Confirmation par user: {}", reservationId, userId);

        try {
            // Vérifier que l'utilisateur est propriétaire
            Reservation reservation = reservationService.getUserReservation(reservationId, userId);

            // Confirmer la réservation
            reservationService.confirmReservation(reservationId);

            Map<String, String> response = new HashMap<>();
            response.put("status", "SUCCESS");
            response.put("message", "Réservation confirmée avec succès");
            response.put("confirmationCode", reservation.getConfirmationCode());
            response.put("seatsUpdated", "true");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("❌ Erreur confirmation réservation: {}", e.getMessage());

            Map<String, String> response = new HashMap<>();
            response.put("status", "ERROR");
            response.put("error", e.getMessage());

            if (e.getMessage().contains("non autorisé")) {
                return ResponseEntity.status(403).body(response);
            }

            return ResponseEntity.status(400).body(response);
        }
    }

    /**
     * Annuler une réservation
     */
    @PostMapping("/cancel/{reservationId}")
    public ResponseEntity<Map<String, String>> cancelReservation(
            @PathVariable Integer reservationId,
            @RequestHeader("X-User-Id") String userId) {

        log.info("❌ POST /cancel/{} - Annulation par user: {}", reservationId, userId);

        try {
            // Vérifier que l'utilisateur est propriétaire
            reservationService.getUserReservation(reservationId, userId);

            // Annuler la réservation
            reservationService.cancelReservation(reservationId);

            Map<String, String> response = new HashMap<>();
            response.put("status", "SUCCESS");
            response.put("message", "Réservation annulée avec succès");
            response.put("seatsRestored", "true");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("❌ Erreur annulation réservation: {}", e.getMessage());

            Map<String, String> response = new HashMap<>();
            response.put("status", "ERROR");
            response.put("error", e.getMessage());

            if (e.getMessage().contains("non autorisé")) {
                return ResponseEntity.status(403).body(response);
            }

            return ResponseEntity.status(400).body(response);
        }
    }

    /**
     * Obtenir les réservations d'un utilisateur
     */
    @GetMapping("/my-reservations")
    public ResponseEntity<List<Reservation>> getUserReservations(@RequestHeader("X-User-Id") String userId) {
        log.info("📋 GET /my-reservations - User: {}", userId);

        List<Reservation> reservations = reservationService.getUserReservations(userId);
        return ResponseEntity.ok(reservations);
    }

    /**
     * Obtenir une réservation spécifique
     */
    @GetMapping("/{reservationId}")
    public ResponseEntity<Reservation> getReservation(
            @PathVariable Integer reservationId,
            @RequestHeader("X-User-Id") String userId) {

        log.info("🔍 GET /{} - User: {}", reservationId, userId);

        try {
            Reservation reservation = reservationService.getUserReservation(reservationId, userId);
            return ResponseEntity.ok(reservation);

        } catch (RuntimeException e) {
            log.error("❌ Erreur récupération réservation: {}", e.getMessage());
            return ResponseEntity.status(403).build();
        }
    }

    /**
     * Vérifier l'authentification
     */
    @GetMapping("/check-auth")
    public ResponseEntity<Map<String, Boolean>> checkAuth(@RequestHeader(value = "X-User-Id", required = false) String userId) {
        boolean isAuthenticated = userId != null && !userId.isEmpty();

        Map<String, Boolean> response = new HashMap<>();
        response.put("authenticated", isAuthenticated);

        return ResponseEntity.ok(response);
    }
}