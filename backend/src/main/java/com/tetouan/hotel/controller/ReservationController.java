package com.tetouan.hotel.controller;

import com.tetouan.hotel.dto.*;
import com.tetouan.hotel.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Controller pour la gestion des réservations
 * Note: CORS géré par l'API Gateway, pas besoin de @CrossOrigin ici
 */
@RestController
@RequestMapping("/api/hotel-reservations")
@RequiredArgsConstructor
@Slf4j
public class ReservationController {

    private final ReservationService reservationService;

    /**
     * POST /api/hotel-reservations/check-disponibilite
     * Vérifie la disponibilité d'une chambre
     */
    @PostMapping("/check-disponibilite")
    public ResponseEntity<DisponibiliteResponse> checkDisponibilite(
            @RequestBody DisponibiliteRequest request) {
        log.info("POST /api/hotel-reservations/check-disponibilite - Vérification de disponibilité");
        DisponibiliteResponse response = reservationService.checkDisponibilite(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/hotel-reservations
     * Crée une nouvelle réservation
     */
    @PostMapping
    public ResponseEntity<ReservationDTO> createReservation(
            @Valid @RequestBody CreateReservationRequest request) {
        log.info("POST /api/hotel-reservations - Création d'une réservation pour la chambre {}",
                request.getChambreId());
        ReservationDTO reservation = reservationService.createReservation(request);
        log.info("Réservation créée avec succès: {}", reservation.getNumeroReservation());
        return ResponseEntity.status(HttpStatus.CREATED).body(reservation);
    }

    /**
     * GET /api/hotel-reservations/{numeroReservation}
     * Récupère une réservation par son numéro
     */
    @GetMapping("/{numeroReservation}")
    public ResponseEntity<ReservationDTO> getReservationByNumero(
            @PathVariable String numeroReservation) {
        log.info("GET /api/hotel-reservations/{} - Récupération d'une réservation", numeroReservation);
        ReservationDTO reservation = reservationService.getReservationByNumero(numeroReservation);
        return ResponseEntity.ok(reservation);
    }

    /**
     * GET /api/hotel-reservations/client/{email}
     * Récupère toutes les réservations d'un client
     */
    @GetMapping("/client/{email}")
    public ResponseEntity<List<ReservationDTO>> getReservationsByClient(
            @PathVariable String email) {
        log.info("GET /api/hotel-reservations/client/{} - Récupération des réservations du client", email);
        List<ReservationDTO> reservations = reservationService.getReservationsByClient(email);
        log.info("Nombre de réservations trouvées: {}", reservations.size());
        return ResponseEntity.ok(reservations);
    }

    /**
     * PUT /api/hotel-reservations/{id}/statut
     * Met à jour le statut d'une réservation
     */
    @PutMapping("/{id}/statut")
    public ResponseEntity<ReservationDTO> updateStatut(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatutRequest request) {
        log.info("PUT /api/hotel-reservations/{}/statut - Mise à jour du statut vers {}",
                id, request.getStatut());
        ReservationDTO reservation = reservationService.updateStatut(id, request);
        return ResponseEntity.ok(reservation);
    }

    /**
     * DELETE /api/hotel-reservations/{id}
     * Annule une réservation
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelReservation(@PathVariable Long id) {
        log.info("DELETE /api/hotel-reservations/{} - Annulation d'une réservation", id);
        reservationService.cancelReservation(id);
        log.info("Réservation {} annulée avec succès", id);
        return ResponseEntity.noContent().build();
    }
}