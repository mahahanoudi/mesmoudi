package com.example.flightservice.repository;

import com.example.flightservice.model.PassengerDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PassengerDetailRepository extends JpaRepository<PassengerDetail, Integer> {

    // Trouver tous les passagers d'une réservation
    List<PassengerDetail> findByReservationId(Integer reservationId);

    // Trouver un passager spécifique par réservation et index
    PassengerDetail findByReservationIdAndPassengerIndex(Integer reservationId, Integer passengerIndex);

    // Compter le nombre de passagers par réservation
    Long countByReservationId(Integer reservationId);

    // Trouver les passagers par type (ADULTE, ENFANT, BEBE)
    List<PassengerDetail> findByPassengerType(PassengerDetail.PassengerType passengerType);

    // Trouver les passagers par nationalité
    List<PassengerDetail> findByNationality(String nationality);

    // Trouver les passagers par classe
    List<PassengerDetail> findByClassType(com.example.flightservice.model.ClassType classType);

    // Vérifier si un CIN existe déjà
    boolean existsByCin(String cin);

    // Vérifier si un passeport existe déjà
    boolean existsByPassport(String passport);

    // Rechercher par nom
    @Query("SELECT p FROM PassengerDetail p WHERE LOWER(p.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<PassengerDetail> searchByName(@Param("name") String name);

    // Trouver les passagers par vol (via la réservation)
    @Query("SELECT pd FROM PassengerDetail pd JOIN Reservation r ON pd.reservationId = r.id WHERE r.flightId = :flightId")
    List<PassengerDetail> findByFlightId(@Param("flightId") String flightId);

    // Statistiques : nombre de passagers par type pour une réservation
    @Query("SELECT pd.passengerType, COUNT(pd) FROM PassengerDetail pd WHERE pd.reservationId = :reservationId GROUP BY pd.passengerType")
    List<Object[]> countPassengersByType(@Param("reservationId") Integer reservationId);

    // Mettre à jour le statut de check-in
    @Query("UPDATE PassengerDetail p SET p.checkInStatus = :status WHERE p.id = :passengerId")
    void updateCheckInStatus(@Param("passengerId") Integer passengerId, @Param("status") String status);

    // Trouver les passagers avec check-in en attente
    List<PassengerDetail> findByCheckInStatus(String checkInStatus);

    // Trouver les passagers par numéro de siège
    PassengerDetail findBySeatNumber(String seatNumber);


    // Vérifier l'unicité du siège pour un vol
    @Query("SELECT COUNT(pd) > 0 FROM PassengerDetail pd JOIN Reservation r ON pd.reservationId = r.id WHERE pd.seatNumber = :seatNumber AND r.flightId = :flightId")
    boolean isSeatTaken(@Param("flightId") String flightId, @Param("seatNumber") String seatNumber);
}