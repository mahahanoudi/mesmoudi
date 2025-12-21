package com.tetouan.tourism.restaurant.repository;

import com.tetouan.tourism.restaurant.model.Reservation;
import com.tetouan.tourism.restaurant.model.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // Find all reservations by user
    List<Reservation> findByUserIdOrderByReservationDateDescReservationTimeDesc(String userId);

    // Find all reservations for a restaurant
    List<Reservation> findByRestaurantIdOrderByReservationDateDescReservationTimeDesc(Long restaurantId);

    // Find reservations for a restaurant on a specific date
    List<Reservation> findByRestaurantIdAndReservationDate(Long restaurantId, LocalDate date);

    // Find reservations by status
    List<Reservation> findByRestaurantIdAndStatus(Long restaurantId, ReservationStatus status);

    // Find active reservations for a user (not cancelled/completed)
    List<Reservation> findByUserIdAndStatusIn(String userId, List<ReservationStatus> statuses);

    // Check if user already has a reservation at same restaurant on same date
    boolean existsByUserIdAndRestaurantIdAndReservationDateAndStatusNot(
            String userId, Long restaurantId, LocalDate date, ReservationStatus status);
}
