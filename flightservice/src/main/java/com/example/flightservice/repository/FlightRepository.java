package com.example.flightservice.repository;

import com.example.flightservice.model.Flight;
import com.example.flightservice.model.FlightStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FlightRepository extends JpaRepository<Flight, String> {

    List<Flight> findByDepartureCityContainingIgnoreCase(String departureCity);

    List<Flight> findByDepartureCode(String departureCode);

    @Query("SELECT f FROM Flight f WHERE DATE(f.departureTime) = :date")
    List<Flight> findByDepartureDate(@Param("date") LocalDate date);

    List<Flight> findByDepartureCityAndArrivalCity(String departureCity, String arrivalCity);

    List<Flight> findByPriceBetween(Double minPrice, Double maxPrice);

    List<Flight> findByAirline(String airline);

    List<Flight> findByStatus(FlightStatus status);

    List<Flight> findByDepartureTimeBetween(LocalDateTime start, LocalDateTime end);

    long countByDepartureTimeBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT AVG(f.price) FROM Flight f")
    Double findAveragePrice();

    boolean existsByFlightNumberAndDepartureTime(String flightNumber, LocalDateTime departureTime);
}