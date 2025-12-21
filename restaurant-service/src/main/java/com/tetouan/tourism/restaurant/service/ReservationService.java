package com.tetouan.tourism.restaurant.service;

import com.tetouan.tourism.restaurant.dto.ReservationDTO;
import com.tetouan.tourism.restaurant.model.Reservation;
import com.tetouan.tourism.restaurant.model.ReservationStatus;
import com.tetouan.tourism.restaurant.model.Restaurant;
import com.tetouan.tourism.restaurant.repository.ReservationRepository;
import com.tetouan.tourism.restaurant.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final RestaurantRepository restaurantRepository;

    /**
     * Create a new reservation
     */
    @Transactional
    public ReservationDTO createReservation(ReservationDTO dto) {
        log.info("Creating reservation for user {} at restaurant {}", dto.getUserId(), dto.getRestaurantId());

        // Find the restaurant
        Restaurant restaurant = restaurantRepository.findById(dto.getRestaurantId())
                .orElseThrow(() -> new RuntimeException("Restaurant non trouvé"));

        // Check if user already has a reservation at this restaurant on same date
        boolean hasExisting = reservationRepository.existsByUserIdAndRestaurantIdAndReservationDateAndStatusNot(
                dto.getUserId(), dto.getRestaurantId(), dto.getReservationDate(), ReservationStatus.CANCELLED);

        if (hasExisting) {
            throw new RuntimeException("Vous avez déjà une réservation à ce restaurant pour cette date");
        }

        // Create reservation
        Reservation reservation = Reservation.builder()
                .userId(dto.getUserId())
                .userName(dto.getUserName())
                .userEmail(dto.getUserEmail())
                .userPhone(dto.getUserPhone())
                .restaurant(restaurant)
                .reservationDate(dto.getReservationDate())
                .reservationTime(dto.getReservationTime())
                .partySize(dto.getPartySize())
                .specialRequests(dto.getSpecialRequests())
                .status(ReservationStatus.CONFIRMED) // Auto-confirm for simplicity
                .createdAt(LocalDateTime.now())
                .build();

        Reservation saved = reservationRepository.save(reservation);
        log.info("Reservation created with ID: {}", saved.getId());

        return mapToDTO(saved);
    }

    /**
     * Get all reservations for a user
     */
    public List<ReservationDTO> getReservationsByUserId(String userId) {
        log.info("Fetching reservations for user: {}", userId);
        return reservationRepository.findByUserIdOrderByReservationDateDescReservationTimeDesc(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all reservations for a restaurant
     */
    public List<ReservationDTO> getReservationsByRestaurantId(Long restaurantId) {
        log.info("Fetching reservations for restaurant: {}", restaurantId);
        return reservationRepository.findByRestaurantIdOrderByReservationDateDescReservationTimeDesc(restaurantId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Cancel a reservation
     */
    @Transactional
    public ReservationDTO cancelReservation(Long reservationId) {
        log.info("Cancelling reservation: {}", reservationId);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Réservation non trouvée"));

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new RuntimeException("Cette réservation est déjà annulée");
        }

        if (reservation.getStatus() == ReservationStatus.COMPLETED) {
            throw new RuntimeException("Impossible d'annuler une réservation terminée");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        Reservation updated = reservationRepository.save(reservation);

        log.info("Reservation {} cancelled successfully", reservationId);
        return mapToDTO(updated);
    }

    /**
     * Get a single reservation by ID
     */
    public ReservationDTO getReservationById(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réservation non trouvée"));
        return mapToDTO(reservation);
    }

    /**
     * Map entity to DTO
     */
    private ReservationDTO mapToDTO(Reservation reservation) {
        Restaurant restaurant = reservation.getRestaurant();
        return ReservationDTO.builder()
                .id(reservation.getId())
                .userId(reservation.getUserId())
                .userName(reservation.getUserName())
                .userEmail(reservation.getUserEmail())
                .userPhone(reservation.getUserPhone())
                .restaurantId(restaurant.getId())
                .restaurantName(restaurant.getNom())
                .restaurantAddress(restaurant.getAdresse())
                .restaurantImage(restaurant.getImageUrl())
                .reservationDate(reservation.getReservationDate())
                .reservationTime(reservation.getReservationTime())
                .partySize(reservation.getPartySize())
                .specialRequests(reservation.getSpecialRequests())
                .status(reservation.getStatus())
                .createdAt(reservation.getCreatedAt())
                .build();
    }
}
