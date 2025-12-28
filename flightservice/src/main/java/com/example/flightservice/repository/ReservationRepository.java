package com.example.flightservice.repository;

import com.example.flightservice.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Integer> {

    List<Reservation> findByUserId(String userId);

    // AJOUTER CETTE MÉTHODE
    @Query("SELECT r FROM Reservation r WHERE r.userId = :userId ORDER BY r.reservationDate DESC")
    List<Reservation> findByUserIdOrderByReservationDateDesc(@Param("userId") String userId);

    List<Reservation> findByFlightId(String flightId);
    List<Reservation> findByFlightClassId(Integer flightClassId);
}