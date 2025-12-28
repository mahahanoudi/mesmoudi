package com.example.flightservice.service;

import com.example.flightservice.dto.ReservationDTO;
import com.example.flightservice.model.*;
import com.example.flightservice.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final FlightClassRepository flightClassRepository;
    private final FlightRepository flightRepository;
    private final PassengerDetailRepository passengerDetailRepository;
    private final ReservationAuditRepository reservationAuditRepository;

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Créer une réservation avec statut PENDING
     */
    @Transactional
    public Reservation createReservation(ReservationDTO reservationDTO) {
        log.info("🎫 Création réservation: vol {}, {} passagers, user {}",
                reservationDTO.getFlightId(), reservationDTO.getPassengersCount(),
                reservationDTO.getUserId());

        // Vérifier si l'utilisateur est connecté
        if (reservationDTO.getUserId() == null || reservationDTO.getUserId().isEmpty()) {
            throw new RuntimeException("Utilisateur non connecté. Veuillez vous connecter.");
        }

        // Récupérer le vol
        Flight flight = flightRepository.findById(reservationDTO.getFlightId())
                .orElseThrow(() -> new RuntimeException("Vol non trouvé"));

        // VÉRIFIER LA DISPONIBILITÉ POUR CHAQUE PASSAGER (CHAQUE CLASSE)
        Map<Integer, Integer> flightClassIdToSeats = new HashMap<>();
        Double totalPrice = 0.0;

        for (ReservationDTO.PassengerInfo passenger : reservationDTO.getPassengers()) {
            ClassType classType = passenger.getClassType();
            if (classType == null) {
                classType = ClassType.ECONOMY;
            }

            // Trouver la FlightClass correspondante
            FlightClass flightClass = flightClassRepository
                    .findByFlightIdAndClassType(reservationDTO.getFlightId(), classType);

            if (flightClass == null) {
                throw new RuntimeException("Classe " + classType + " non disponible pour ce vol");
            }

            // Stocker le flight_class_id pour le passager dans le DTO
            passenger.setFlightClassId(flightClass.getId());

            // Compter les places par flight_class_id
            flightClassIdToSeats.put(flightClass.getId(),
                    flightClassIdToSeats.getOrDefault(flightClass.getId(), 0) + 1);

            // Vérifier la disponibilité pour cette classe
            if (flightClass.getAvailableSeats() < flightClassIdToSeats.get(flightClass.getId())) {
                throw new RuntimeException("Pas assez de places en " + classType +
                        ". Places restantes: " + flightClass.getAvailableSeats() +
                        ", demandées: " + flightClassIdToSeats.get(flightClass.getId()));
            }

            // Calculer le prix pour ce passager
            Double basePrice = flight.getPrice() != null ? flight.getPrice() : 0.0;
            Double classPrice = flightClass.getClassPrice() != null ? flightClass.getClassPrice() : 0.0;
            Double pricePerPassenger = basePrice + classPrice;
            totalPrice += pricePerPassenger;

            log.info("💰 Passager classe {}: base={}, supplément={}, total={}",
                    classType, basePrice, classPrice, pricePerPassenger);
        }

        log.info("📊 Places nécessaires par flight_class_id: {}", flightClassIdToSeats);
        log.info("💰 Prix total calculé: {}", totalPrice);

        // Créer la réservation
        Reservation reservation = new Reservation();
        reservation.setUserId(reservationDTO.getUserId());
        reservation.setFlightId(reservationDTO.getFlightId());
        reservation.setPassengersCount(reservationDTO.getPassengersCount());
        reservation.setTotalPrice(totalPrice);
        reservation.setStatus(ReservationStatus.PENDING);
        reservation.setReservationDate(LocalDateTime.now());

        // Pour compatibilité, on garde le premier flight_class_id
        if (!reservationDTO.getPassengers().isEmpty() &&
                reservationDTO.getPassengers().get(0).getFlightClassId() != null) {
            reservation.setFlightClassId(reservationDTO.getPassengers().get(0).getFlightClassId());
        }

        // Sauvegarder pour générer l'ID
        Reservation savedReservation = reservationRepository.save(reservation);

        // Générer le code de confirmation
        savedReservation.generateConfirmationCode();
        savedReservation = reservationRepository.save(savedReservation);

        log.info("✅ Réservation {} créée avec statut PENDING, prix total: {}",
                savedReservation.getId(), totalPrice);

        // Créer les détails des passagers
        createPassengerDetails(savedReservation, reservationDTO.getPassengers());

        return savedReservation;
    }

    /**
     * Créer les détails des passagers avec flight_class_id
     */
    private void createPassengerDetails(Reservation reservation,
                                        List<ReservationDTO.PassengerInfo> passengerInfos) {

        for (int i = 0; i < passengerInfos.size(); i++) {
            ReservationDTO.PassengerInfo passengerInfo = passengerInfos.get(i);

            PassengerDetail passenger = new PassengerDetail();
            passenger.setReservationId(reservation.getId());
            passenger.setPassengerIndex(i + 1);
            passenger.setPassengerType(passengerInfo.getPassengerType());
            passenger.setFirstName(passengerInfo.getFirstName());
            passenger.setLastName(passengerInfo.getLastName());
            passenger.setNationality(passengerInfo.getNationality());
            passenger.setCin(passengerInfo.getCin());
            passenger.setPassport(passengerInfo.getPassport());

            if (passengerInfo.getBirthDate() != null && !passengerInfo.getBirthDate().isEmpty()) {
                passenger.setBirthDate(LocalDate.parse(passengerInfo.getBirthDate()));
            }

            // Assigner la classe au passager
            ClassType classType = passengerInfo.getClassType();
            if (classType == null) {
                classType = ClassType.ECONOMY;
            }
            passenger.setClassType(classType);

            // Assigner le flight_class_id (IMPORTANT)
            Integer flightClassId = passengerInfo.getFlightClassId();
            if (flightClassId != null) {
                passenger.setFlightClassId(flightClassId);
            } else {
                // Trouver le flight_class_id si non fourni
                FlightClass flightClass = flightClassRepository
                        .findByFlightIdAndClassType(reservation.getFlightId(), classType);
                if (flightClass != null) {
                    passenger.setFlightClassId(flightClass.getId());
                    flightClassId = flightClass.getId();
                } else {
                    throw new RuntimeException("Impossible de trouver flight_class pour classe: " + classType);
                }
            }

            passenger.setCreatedAt(LocalDateTime.now());

            PassengerDetail savedPassenger = passengerDetailRepository.save(passenger);

            log.info("👤 Passager {} créé - Classe: {}, flight_class_id: {}",
                    savedPassenger.getId(), classType, flightClassId);
        }

        log.info("👥 {} passagers créés pour réservation {}",
                passengerInfos.size(), reservation.getId());
    }

    /**
     * Confirmer une réservation et DÉDUIRE LES PLACES PAR CLASSE
     */
    @Transactional
    public Reservation confirmReservation(Integer reservationId) {
        log.info("✅ CONFIRMATION Réservation ID: {}", reservationId);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Réservation non trouvée"));

        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw new RuntimeException("Réservation déjà traitée: " + reservation.getStatus());
        }

        // 1. Récupérer TOUS les passagers
        List<PassengerDetail> passengerDetails = passengerDetailRepository
                .findByReservationId(reservationId);

        if (passengerDetails.isEmpty()) {
            throw new RuntimeException("Aucun passager trouvé pour cette réservation");
        }

        log.info("🔢 Réservation a {} passagers", passengerDetails.size());

        Map<Integer, Integer> seatsToDeductByFlightClass = new HashMap<>();
        for (PassengerDetail passenger : passengerDetails) {
            Integer flightClassId = passenger.getFlightClassId();
            if (flightClassId == null) {
                FlightClass flightClass = flightClassRepository
                        .findByFlightIdAndClassType(reservation.getFlightId(), passenger.getClassType());
                if (flightClass != null) {
                    flightClassId = flightClass.getId();
                    passenger.setFlightClassId(flightClassId);
                    passengerDetailRepository.save(passenger);
                } else {
                    throw new RuntimeException("Impossible de trouver flightClass pour passager " +
                            passenger.getId() + ", classe " + passenger.getClassType());
                }
            }
            seatsToDeductByFlightClass.put(flightClassId,
                    seatsToDeductByFlightClass.getOrDefault(flightClassId, 0) + 1);
        }

        log.info("Places à déduire par flightClassId: {}", seatsToDeductByFlightClass);

        // 🔥🔥 SQL NATIVE - IMPERTURBABLE - REMPLACE TOUTE LA BOUCLE !
        for (Map.Entry<Integer, Integer> entry : seatsToDeductByFlightClass.entrySet()) {
            Integer flightClassId = entry.getKey();
            Integer seatsToDeduct = entry.getValue();

            // VÉRIFIER AVANT
            String checkBeforeSql = "SELECT available_seats FROM flight_class WHERE id = ?";
            BigInteger beforeSeats = (BigInteger) entityManager.createNativeQuery(checkBeforeSql)
                    .setParameter(1, flightClassId)
                    .getSingleResult();

            log.info("📊 AVANT SQL - flightClassId={}, available_seats={}", flightClassId, beforeSeats);

            if (beforeSeats.intValue() < seatsToDeduct) {
                throw new RuntimeException("Pas assez de places. Disponibles: " + beforeSeats +
                        ", demandées: " + seatsToDeduct);
            }

            // 🔥 UPDATE SQL NATIVE DIRECT
            String updateSql = "UPDATE flight_class SET available_seats = available_seats - ? WHERE id = ?";
            Query updateQuery = entityManager.createNativeQuery(updateSql);
            updateQuery.setParameter(1, seatsToDeduct);
            updateQuery.setParameter(2, flightClassId);
            int rowsUpdated = updateQuery.executeUpdate();

            log.info("💥 SQL UPDATE - flightClassId={}, seats_deducted={}, rows_updated={}",
                    flightClassId, seatsToDeduct, rowsUpdated);

            // VÉRIFIER APRÈS
            String checkAfterSql = "SELECT available_seats FROM flight_class WHERE id = ?";
            BigInteger afterSeats = (BigInteger) entityManager.createNativeQuery(checkAfterSql)
                    .setParameter(1, flightClassId)
                    .getSingleResult();

            log.info("✅ APRÈS SQL - flightClassId={}, available_seats={}, CHANGEMENT={}→{}",
                    flightClassId, afterSeats, beforeSeats, afterSeats);
        }

        // 4. Confirmer la réservation
        ReservationStatus oldStatus = reservation.getStatus();
        reservation.setStatus(ReservationStatus.CONFIRMED);
        Reservation confirmedReservation = reservationRepository.save(reservation);

        createAuditLog(confirmedReservation, oldStatus, ReservationStatus.CONFIRMED,
                "Réservation confirmée - places déduites SQL natif: " + seatsToDeductByFlightClass);

        log.info("🎉 RÉSERVATION {} CONFIRMÉE - {} passagers, classes mises à jour: {}",
                reservationId, passengerDetails.size(), seatsToDeductByFlightClass);

        return confirmedReservation;
    }

    /**
     * Annuler une réservation et RESTAURER les places PAR FLIGHT_CLASS_ID
     */
    @Transactional
    public Reservation cancelReservation(Integer reservationId) {
        log.info("❌ Annulation réservation: {}", reservationId);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Réservation non trouvée"));

        ReservationStatus oldStatus = reservation.getStatus();

        // Si confirmée, RESTAURER les places PAR FLIGHT_CLASS_ID
        if (oldStatus == ReservationStatus.CONFIRMED) {
            List<PassengerDetail> passengerDetails = passengerDetailRepository
                    .findByReservationId(reservationId);

            // Compter les places à restaurer par flight_class_id
            Map<Integer, Integer> seatsByFlightClassId = new HashMap<>();
            for (PassengerDetail pd : passengerDetails) {
                if (pd.getFlightClassId() != null) {
                    seatsByFlightClassId.put(pd.getFlightClassId(),
                            seatsByFlightClassId.getOrDefault(pd.getFlightClassId(), 0) + 1);
                }
            }

            // Restaurer les places pour chaque flight_class_id
            for (Map.Entry<Integer, Integer> entry : seatsByFlightClassId.entrySet()) {
                FlightClass flightClass = flightClassRepository.findById(entry.getKey()).orElse(null);
                if (flightClass != null) {
                    int newAvailableSeats = flightClass.getAvailableSeats() + entry.getValue();
                    flightClass.setAvailableSeats(newAvailableSeats);
                    flightClassRepository.save(flightClass);
                    log.info("🔄 +{} places restaurées en {} (classe {})",
                            entry.getValue(), flightClass.getClassType(), entry.getKey());
                }
            }
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        Reservation cancelledReservation = reservationRepository.save(reservation);

        createAuditLog(cancelledReservation, oldStatus, ReservationStatus.CANCELLED,
                "Réservation annulée par l'utilisateur");

        return cancelledReservation;
    }

    /**
     * Créer un log d'audit
     */
    private void createAuditLog(Reservation reservation, ReservationStatus oldStatus,
                                ReservationStatus newStatus, String reason) {
        ReservationAudit audit = new ReservationAudit();
        audit.setReservationId(reservation.getId());
        audit.setOldStatus(oldStatus != null ? oldStatus.name() : null);
        audit.setNewStatus(newStatus.name());
        audit.setChangedBy(reservation.getUserId());
        audit.setChangeReason(reason);
        audit.setChangedAt(LocalDateTime.now());

        reservationAuditRepository.save(audit);

        log.debug("📝 Audit log créé pour réservation {}: {} -> {}",
                reservation.getId(), oldStatus, newStatus);
    }

    /**
     * Obtenir les réservations d'un utilisateur
     */
    public List<Reservation> getUserReservations(String userId) {
        return reservationRepository.findByUserIdOrderByReservationDateDesc(userId);
    }

    /**
     * Obtenir une réservation par ID avec vérification de propriété
     */
    public Reservation getUserReservation(Integer reservationId, String userId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Réservation non trouvée"));

        if (!reservation.getUserId().equals(userId)) {
            throw new RuntimeException("Accès non autorisé à cette réservation");
        }

        return reservation;
    }

    /**
     * Vérifier la disponibilité pour une réservation - CORRIGÉE
     */
    public Map<String, Object> checkAvailability(ReservationDTO reservationDTO) {
        Map<String, Object> response = new HashMap<>();
        Map<Integer, Map<String, Object>> availabilityByClass = new HashMap<>();
        boolean allAvailable = true;

        // CORRECTION: Créer une map pour compter les passagers par classe
        Map<ClassType, Integer> passengersByClass = new HashMap<>();

        // Compter les passagers par classe
        for (ReservationDTO.PassengerInfo passenger : reservationDTO.getPassengers()) {
            ClassType classType = passenger.getClassType();
            if (classType == null) {
                classType = ClassType.ECONOMY;
            }
            passengersByClass.put(classType,
                    passengersByClass.getOrDefault(classType, 0) + 1);
        }

        // Vérifier la disponibilité pour chaque classe
        for (Map.Entry<ClassType, Integer> entry : passengersByClass.entrySet()) {
            ClassType classType = entry.getKey();
            Integer requiredSeats = entry.getValue();

            FlightClass flightClass = flightClassRepository
                    .findByFlightIdAndClassType(reservationDTO.getFlightId(), classType);

            if (flightClass == null) {
                allAvailable = false;
                availabilityByClass.put(-1,
                        Map.of("available", false,
                                "message", "Classe " + classType + " non disponible",
                                "classType", classType.name()));
            } else {
                boolean available = flightClass.getAvailableSeats() >= requiredSeats;
                if (!available) allAvailable = false;

                availabilityByClass.put(flightClass.getId(),
                        Map.of("available", available,
                                "availableSeats", flightClass.getAvailableSeats(),
                                "requiredSeats", requiredSeats,
                                "classType", classType.name(),
                                "message", available ? "Disponible" :
                                        "Seulement " + flightClass.getAvailableSeats() + " place(s) disponible(s)"));
            }
        }

        response.put("allAvailable", allAvailable);
        response.put("details", availabilityByClass);
        response.put("flightId", reservationDTO.getFlightId());
        response.put("passengersCount", reservationDTO.getPassengersCount());
        response.put("passengersByClass", passengersByClass);

        return response;
    }

    /**
     * Vérifier la disponibilité simple (alternative)
     */
    public Map<String, Object> checkSimpleAvailability(String flightId, ClassType classType, Integer passengers) {
        Map<String, Object> response = new HashMap<>();

        FlightClass flightClass = flightClassRepository
                .findByFlightIdAndClassType(flightId, classType);

        if (flightClass == null) {
            response.put("available", false);
            response.put("message", "Classe " + classType + " non disponible");
            return response;
        }

        boolean available = flightClass.getAvailableSeats() >= passengers;
        response.put("available", available);
        response.put("availableSeats", flightClass.getAvailableSeats());
        response.put("requiredSeats", passengers);
        response.put("classType", classType.name());

        if (!available) {
            response.put("message", "Seulement " + flightClass.getAvailableSeats() + " place(s) disponible(s)");
        }

        return response;
    }
}