package com.tetouan.hotel.repository;

import com.tetouan.hotel.model.Hotel;
import com.tetouan.hotel.model.Chambre;
import com.tetouan.hotel.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    Optional<Reservation> findByNumeroReservation(String numeroReservation);

    List<Reservation> findByClientEmail(String clientEmail);

    List<Reservation> findByChambreId(Long chambreId);

    @Query("SELECT r FROM Reservation r WHERE r.chambre.id = :chambreId " +
            "AND r.statut NOT IN ('ANNULEE', 'TERMINEE') " +
            "AND ((r.dateArrivee <= :dateDepart AND r.dateDepart >= :dateArrivee))")
    List<Reservation> findConflictingReservations(
            @Param("chambreId") Long chambreId,
            @Param("dateArrivee") LocalDate dateArrivee,
            @Param("dateDepart") LocalDate dateDepart
    );

    @Query("SELECT r FROM Reservation r WHERE r.chambre.hotel.id = :hotelId " +
            "AND r.dateArrivee >= :dateDebut AND r.dateArrivee <= :dateFin")
    List<Reservation> findByHotelAndDateRange(
            @Param("hotelId") Long hotelId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin
    );
}