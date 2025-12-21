package com.tetouan.tourism.restaurant.controller;

import com.tetouan.tourism.restaurant.dto.ReservationDTO;
import com.tetouan.tourism.restaurant.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@Slf4j
// CORS handled by API Gateway
public class ReservationController {

    private final ReservationService reservationService;

    /**
     * Create a new reservation
     * POST /api/reservations
     */
    @PostMapping
    public ResponseEntity<?> createReservation(@Valid @RequestBody ReservationDTO dto) {
        try {
            log.info("POST /api/reservations - Creating reservation for user: {}", dto.getUserId());
            ReservationDTO created = reservationService.createReservation(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            log.error("Error creating reservation: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get all reservations for a user
     * GET /api/reservations/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReservationDTO>> getReservationsByUser(@PathVariable String userId) {
        log.info("GET /api/reservations/user/{}", userId);
        List<ReservationDTO> reservations = reservationService.getReservationsByUserId(userId);
        return ResponseEntity.ok(reservations);
    }

    /**
     * Get all reservations for a restaurant
     * GET /api/reservations/restaurant/{restaurantId}
     */
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<ReservationDTO>> getReservationsByRestaurant(@PathVariable Long restaurantId) {
        log.info("GET /api/reservations/restaurant/{}", restaurantId);
        List<ReservationDTO> reservations = reservationService.getReservationsByRestaurantId(restaurantId);
        return ResponseEntity.ok(reservations);
    }

    /**
     * Get a single reservation by ID
     * GET /api/reservations/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getReservationById(@PathVariable Long id) {
        try {
            log.info("GET /api/reservations/{}", id);
            ReservationDTO reservation = reservationService.getReservationById(id);
            return ResponseEntity.ok(reservation);
        } catch (RuntimeException e) {
            log.error("Error fetching reservation: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Cancel a reservation
     * PUT /api/reservations/{id}/cancel
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelReservation(@PathVariable Long id) {
        try {
            log.info("PUT /api/reservations/{}/cancel", id);
            ReservationDTO cancelled = reservationService.cancelReservation(id);
            return ResponseEntity.ok(cancelled);
        } catch (RuntimeException e) {
            log.error("Error cancelling reservation: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
