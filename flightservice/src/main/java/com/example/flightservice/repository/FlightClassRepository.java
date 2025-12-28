package com.example.flightservice.repository;

import com.example.flightservice.model.FlightClass;
import com.example.flightservice.model.ClassType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface FlightClassRepository extends JpaRepository<FlightClass, Integer> {

    // Trouver toutes les classes d'un vol
    List<FlightClass> findByFlightId(String flightId);

    // Trouver une classe spécifique d'un vol
    FlightClass findByFlightIdAndClassType(String flightId, ClassType classType);

    // Trouver les classes disponibles (avec assez de places)
    @Query("SELECT fc FROM FlightClass fc WHERE fc.flightId = :flightId AND fc.availableSeats >= :passengers")
    List<FlightClass> findAvailableClasses(@Param("flightId") String flightId,
                                           @Param("passengers") Integer passengers);

    // Somme des places disponibles pour un vol
    @Query("SELECT SUM(fc.availableSeats) FROM FlightClass fc WHERE fc.flightId = :flightId")
    Integer sumAvailableSeatsByFlightId(@Param("flightId") String flightId);

    // Déduire les places disponibles (ancienne méthode - gardée pour compatibilité)
    @Modifying
    @Transactional
    @Query("UPDATE FlightClass fc SET fc.availableSeats = fc.availableSeats - :passengers " +
            "WHERE fc.id = :classId AND fc.availableSeats >= :passengers")
    int decreaseAvailableSeats(@Param("classId") Integer classId,
                               @Param("passengers") Integer passengers);

    // NOUVELLE MÉTHODE : Déduire les places disponibles avec retour du nombre de lignes affectées
    @Modifying
    @Transactional
    @Query("UPDATE FlightClass fc SET fc.availableSeats = fc.availableSeats - :seats " +
            "WHERE fc.id = :flightClassId AND fc.availableSeats >= :seats")
    int decreaseAvailableSeatsById(@Param("flightClassId") Integer flightClassId,
                                   @Param("seats") Integer seats);

    // NOUVELLE MÉTHODE : Déduire les places disponibles par flightId et classType
    @Modifying
    @Transactional
    @Query("UPDATE FlightClass fc SET fc.availableSeats = fc.availableSeats - :seats " +
            "WHERE fc.flightId = :flightId AND fc.classType = :classType AND fc.availableSeats >= :seats")
    int decreaseAvailableSeatsByFlightAndClass(@Param("flightId") String flightId,
                                               @Param("classType") ClassType classType,
                                               @Param("seats") Integer seats);

    // NOUVELLE MÉTHODE : Augmenter les places disponibles (pour annulation)
    @Modifying
    @Transactional
    @Query("UPDATE FlightClass fc SET fc.availableSeats = fc.availableSeats + :seats " +
            "WHERE fc.id = :flightClassId")
    int increaseAvailableSeats(@Param("flightClassId") Integer flightClassId,
                               @Param("seats") Integer seats);

    // NOUVELLE MÉTHODE : Vérifier la disponibilité d'une classe spécifique
    @Query("SELECT CASE WHEN fc.availableSeats >= :requiredSeats THEN true ELSE false END " +
            "FROM FlightClass fc WHERE fc.id = :flightClassId")
    boolean isClassAvailable(@Param("flightClassId") Integer flightClassId,
                             @Param("requiredSeats") Integer requiredSeats);

    // NOUVELLE MÉTHODE : Obtenir le nombre de places disponibles pour une classe
    @Query("SELECT fc.availableSeats FROM FlightClass fc WHERE fc.id = :flightClassId")
    Integer getAvailableSeats(@Param("flightClassId") Integer flightClassId);

    // NOUVELLE MÉTHODE : Trouver par ID avec vérification de disponibilité
    @Query("SELECT fc FROM FlightClass fc WHERE fc.id = :id AND fc.availableSeats > 0")
    FlightClass findAvailableById(@Param("id") Integer id);

    // NOUVELLE MÉTHODE : Mettre à jour les places disponibles (version générique)
    @Modifying
    @Transactional
    @Query("UPDATE FlightClass fc SET fc.availableSeats = :newSeats WHERE fc.id = :flightClassId")
    int updateAvailableSeats(@Param("flightClassId") Integer flightClassId,
                             @Param("newSeats") Integer newSeats);

    // NOUVELLE MÉTHODE : Compter le nombre de classes disponibles pour un vol
    @Query("SELECT COUNT(fc) FROM FlightClass fc WHERE fc.flightId = :flightId AND fc.availableSeats > 0")
    Long countAvailableClassesByFlightId(@Param("flightId") String flightId);

    // NOUVELLE MÉTHODE : Trouver la classe la moins chère disponible
    @Query("SELECT fc FROM FlightClass fc " +
            "WHERE fc.flightId = :flightId AND fc.availableSeats > 0 " +
            "ORDER BY fc.classPrice ASC LIMIT 1")
    FlightClass findCheapestAvailableClass(@Param("flightId") String flightId);

    // NOUVELLE MÉTHODE : Vérifier si une classe existe pour un vol
    @Query("SELECT CASE WHEN COUNT(fc) > 0 THEN true ELSE false END " +
            "FROM FlightClass fc WHERE fc.flightId = :flightId AND fc.classType = :classType")
    boolean existsByFlightIdAndClassType(@Param("flightId") String flightId,
                                         @Param("classType") ClassType classType);

    // NOUVELLE MÉTHODE : Obtenir le prix total pour une classe (basePrice + classPrice)
    // Note: Cette méthode nécessite une jointure avec Flight
    @Query("SELECT f.price + fc.classPrice FROM FlightClass fc " +
            "JOIN Flight f ON fc.flightId = f.id " +
            "WHERE fc.id = :flightClassId")
    Double getTotalPrice(@Param("flightClassId") Integer flightClassId);
}