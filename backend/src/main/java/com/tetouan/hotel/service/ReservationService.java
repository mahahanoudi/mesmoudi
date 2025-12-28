package com.tetouan.hotel.service;

import com.tetouan.hotel.dto.*;
import com.tetouan.hotel.model.Reservation;
import com.tetouan.hotel.model.Chambre;
import com.tetouan.hotel.repository.ReservationRepository;
import com.tetouan.hotel.repository.ChambreRepository;
import com.tetouan.hotel.exception.ResourceNotFoundException;
import com.tetouan.hotel.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ChambreRepository chambreRepository;

    /**
     * Vérifie la disponibilité d'une chambre pour des dates données
     */
    @Transactional(readOnly = true)
    public DisponibiliteResponse checkDisponibilite(DisponibiliteRequest request) {
        log.info("Vérification de disponibilité pour la chambre {} du {} au {}",
                request.getChambreId(), request.getDateArrivee(), request.getDateDepart());

        // Validation des dates
        if (request.getDateArrivee().isBefore(LocalDate.now())) {
            return new DisponibiliteResponse(false, "La date d'arrivée doit être dans le futur", null);
        }

        if (request.getDateDepart().isBefore(request.getDateArrivee())) {
            return new DisponibiliteResponse(false, "La date de départ doit être après la date d'arrivée", null);
        }

        // Récupération de la chambre
        Chambre chambre = chambreRepository.findById(request.getChambreId())
                .orElseThrow(() -> new ResourceNotFoundException("Chambre non trouvée"));

        if (!chambre.getDisponible()) {
            return new DisponibiliteResponse(false, "Cette chambre n'est pas disponible", null);
        }

        // Vérification des réservations existantes
        List<Reservation> conflits = reservationRepository.findConflictingReservations(
                request.getChambreId(),
                request.getDateArrivee(),
                request.getDateDepart()
        );

        if (!conflits.isEmpty()) {
            return new DisponibiliteResponse(false, "La chambre n'est pas disponible pour ces dates", null);
        }

        // Calcul du prix total
        long nombreNuits = ChronoUnit.DAYS.between(request.getDateArrivee(), request.getDateDepart());
        BigDecimal prixTotal = chambre.getPrixParNuit().multiply(BigDecimal.valueOf(nombreNuits));

        return new DisponibiliteResponse(true, "Chambre disponible", prixTotal);
    }

    /**
     * Crée une nouvelle réservation
     */
    public ReservationDTO createReservation(CreateReservationRequest request) {
        log.info("Création d'une réservation pour la chambre {}", request.getChambreId());

        // Validation des dates
        validateDates(request.getDateArrivee(), request.getDateDepart());

        // Récupération de la chambre
        Chambre chambre = chambreRepository.findById(request.getChambreId())
                .orElseThrow(() -> new ResourceNotFoundException("Chambre non trouvée"));

        // Vérification de la disponibilité
        DisponibiliteRequest dispRequest = new DisponibiliteRequest(
                request.getChambreId(), request.getDateArrivee(), request.getDateDepart()
        );
        DisponibiliteResponse disponibilite = checkDisponibilite(dispRequest);

        if (!disponibilite.getDisponible()) {
            throw new BusinessException(disponibilite.getMessage());
        }

        // Vérification de la capacité
        int totalPersonnes = request.getNombreAdultes() + request.getNombreEnfants();
        if (totalPersonnes > chambre.getCapacitePersonnes()) {
            throw new BusinessException("Le nombre de personnes dépasse la capacité de la chambre");
        }

        // Création de la réservation
        Reservation reservation = new Reservation();
        reservation.setChambre(chambre);
        reservation.setClientNom(request.getClientNom());
        reservation.setClientPrenom(request.getClientPrenom());
        reservation.setClientEmail(request.getClientEmail());
        reservation.setClientTelephone(request.getClientTelephone());
        reservation.setClientAdresse(request.getClientAdresse());
        reservation.setDateArrivee(request.getDateArrivee());
        reservation.setDateDepart(request.getDateDepart());

        long nombreNuits = ChronoUnit.DAYS.between(request.getDateArrivee(), request.getDateDepart());
        reservation.setNombreNuits((int) nombreNuits);
        reservation.setNombreAdultes(request.getNombreAdultes());
        reservation.setNombreEnfants(request.getNombreEnfants());
        reservation.setPrixTotal(disponibilite.getPrixTotal());
        reservation.setStatut(Reservation.StatutReservation.EN_ATTENTE);
        reservation.setDemandesSpeciales(request.getDemandesSpeciales());

        Reservation savedReservation = reservationRepository.save(reservation);

        log.info("Réservation créée avec succès: {}", savedReservation.getNumeroReservation());

        return convertToDTO(savedReservation);
    }

    /**
     * Récupère une réservation par son numéro
     */
    @Transactional(readOnly = true)
    public ReservationDTO getReservationByNumero(String numeroReservation) {
        log.info("Récupération de la réservation: {}", numeroReservation);

        Reservation reservation = reservationRepository.findByNumeroReservation(numeroReservation)
                .orElseThrow(() -> new ResourceNotFoundException("Réservation non trouvée"));

        return convertToDTO(reservation);
    }

    /**
     * Récupère toutes les réservations d'un client
     */
    @Transactional(readOnly = true)
    public List<ReservationDTO> getReservationsByClient(String email) {
        log.info("Récupération des réservations du client: {}", email);

        List<Reservation> reservations = reservationRepository.findByClientEmail(email);

        return reservations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Met à jour le statut d'une réservation
     */
    public ReservationDTO updateStatut(Long id, UpdateStatutRequest request) {
        log.info("Mise à jour du statut de la réservation {} vers {}", id, request.getStatut());

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Réservation non trouvée"));

        try {
            Reservation.StatutReservation nouveauStatut = Reservation.StatutReservation.valueOf(request.getStatut());
            reservation.setStatut(nouveauStatut);

            if (nouveauStatut == Reservation.StatutReservation.ANNULEE) {
                reservation.setDateAnnulation(java.time.LocalDateTime.now());
            }

            Reservation updatedReservation = reservationRepository.save(reservation);
            return convertToDTO(updatedReservation);

        } catch (IllegalArgumentException e) {
            throw new BusinessException("Statut invalide: " + request.getStatut());
        }
    }

    /**
     * Annule une réservation
     */
    public void cancelReservation(Long id) {
        log.info("Annulation de la réservation: {}", id);

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Réservation non trouvée"));

        if (reservation.getStatut() == Reservation.StatutReservation.TERMINEE) {
            throw new BusinessException("Impossible d'annuler une réservation terminée");
        }

        reservation.setStatut(Reservation.StatutReservation.ANNULEE);
        reservation.setDateAnnulation(java.time.LocalDateTime.now());
        reservationRepository.save(reservation);

        log.info("Réservation {} annulée avec succès", id);
    }

    // Méthodes privées

    private void validateDates(LocalDate dateArrivee, LocalDate dateDepart) {
        if (dateArrivee.isBefore(LocalDate.now())) {
            throw new BusinessException("La date d'arrivée doit être dans le futur");
        }

        if (dateDepart.isBefore(dateArrivee) || dateDepart.isEqual(dateArrivee)) {
            throw new BusinessException("La date de départ doit être après la date d'arrivée");
        }

        long nombreNuits = ChronoUnit.DAYS.between(dateArrivee, dateDepart);
        if (nombreNuits > 30) {
            throw new BusinessException("La durée maximale du séjour est de 30 nuits");
        }
    }

    private ReservationDTO convertToDTO(Reservation reservation) {
        ReservationDTO dto = new ReservationDTO();
        dto.setId(reservation.getId());
        dto.setNumeroReservation(reservation.getNumeroReservation());
        dto.setChambreId(reservation.getChambre().getId());
        dto.setChambreNumero(reservation.getChambre().getNumero());
        dto.setHotelNom(reservation.getChambre().getHotel().getNom());
        dto.setClientNom(reservation.getClientNom());
        dto.setClientPrenom(reservation.getClientPrenom());
        dto.setClientEmail(reservation.getClientEmail());
        dto.setClientTelephone(reservation.getClientTelephone());
        dto.setDateArrivee(reservation.getDateArrivee());
        dto.setDateDepart(reservation.getDateDepart());
        dto.setNombreNuits(reservation.getNombreNuits());
        dto.setNombreAdultes(reservation.getNombreAdultes());
        dto.setNombreEnfants(reservation.getNombreEnfants());
        dto.setPrixTotal(reservation.getPrixTotal());
        dto.setAcompteVerse(reservation.getAcompteVerse());
        dto.setStatut(reservation.getStatut().name());
        dto.setDemandesSpeciales(reservation.getDemandesSpeciales());
        return dto;
    }
}