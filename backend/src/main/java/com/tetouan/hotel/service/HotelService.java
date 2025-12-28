package com.tetouan.hotel.service;

import com.tetouan.hotel.dto.*;
import com.tetouan.hotel.model.Hotel;
import com.tetouan.hotel.model.Chambre;
import com.tetouan.hotel.repository.HotelRepository;
import com.tetouan.hotel.repository.ChambreRepository;
import com.tetouan.hotel.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class HotelService {

    private final HotelRepository hotelRepository;
    private final ChambreRepository chambreRepository;
    private final ExternalHotelApiService externalApiService;

    /**
     * Synchronise les hôtels depuis l'API externe vers la base de données locale
     */
    public void synchronizeHotelsFromExternalApi() {
        log.info("Début de la synchronisation des hôtels depuis l'API externe");

        try {
            List<Hotel> externalHotels = externalApiService.fetchAllHotels();

            for (Hotel externalHotel : externalHotels) {
                Hotel existingHotel = hotelRepository
                        .findByExternalId(externalHotel.getExternalId())
                        .orElse(null);

                if (existingHotel != null) {
                    // Mise à jour de l'hôtel existant
                    updateHotelFromExternal(existingHotel, externalHotel);
                    hotelRepository.save(existingHotel);
                } else {
                    // Création d'un nouvel hôtel
                    hotelRepository.save(externalHotel);
                }
            }

            log.info("Synchronisation terminée: {} hôtels traités", externalHotels.size());

        } catch (Exception e) {
            log.error("Erreur lors de la synchronisation des hôtels", e);
            throw new RuntimeException("Échec de la synchronisation", e);
        }
    }

    /**
     * Récupère tous les hôtels de Tétouan
     */
    @Transactional(readOnly = true)
    public List<HotelSummaryDTO> getAllHotels() {
        log.info("Récupération de tous les hôtels de Tétouan");

        List<Hotel> hotels = hotelRepository.findByVilleAndActifTrue("Tétouan");

        return hotels.stream()
                .map(this::convertToSummaryDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère un hôtel par son ID avec tous ses détails
     */
    @Transactional(readOnly = true)
    public HotelDTO getHotelById(Long id) {
        log.info("Récupération de l'hôtel avec l'ID: {}", id);

        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hôtel non trouvé avec l'ID: " + id));

        return convertToDetailDTO(hotel);
    }

    /**
     * Recherche d'hôtels selon des critères
     */
    @Transactional(readOnly = true)
    public List<HotelSummaryDTO> searchHotels(RechercheHotelRequest request) {
        log.info("Recherche d'hôtels avec critères: {}", request);

        List<Hotel> hotels = hotelRepository.findByVilleAndActifTrue("Tétouan");

        // Filtrage par étoiles minimum
        if (request.getEtoilesMin() != null) {
            hotels = hotels.stream()
                    .filter(h -> h.getEtoiles() >= request.getEtoilesMin())
                    .collect(Collectors.toList());
        }

        // Filtrage par budget maximum
        if (request.getBudgetMax() != null) {
            hotels = hotels.stream()
                    .filter(h -> hasRoomsWithinBudget(h, request.getBudgetMax()))
                    .collect(Collectors.toList());
        }

        return hotels.stream()
                .map(this::convertToSummaryDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère les chambres disponibles d'un hôtel
     */
    @Transactional(readOnly = true)
    public List<ChambreDTO> getAvailableRooms(Long hotelId) {
        log.info("Récupération des chambres disponibles pour l'hôtel: {}", hotelId);

        List<Chambre> chambres = chambreRepository.findByHotelIdAndDisponibleTrue(hotelId);

        return chambres.stream()
                .map(this::convertChambreToDTO)
                .collect(Collectors.toList());
    }

    // Méthodes de conversion privées

    private HotelSummaryDTO convertToSummaryDTO(Hotel hotel) {
        HotelSummaryDTO dto = new HotelSummaryDTO();
        dto.setId(hotel.getId());
        dto.setNom(hotel.getNom());
        dto.setAdresse(hotel.getAdresse());
        dto.setEtoiles(hotel.getEtoiles());
        dto.setImageUrl(hotel.getImages().isEmpty() ? null : hotel.getImages().get(0));
        dto.setPrixMinimum(calculateMinPrice(hotel));
        dto.setDisponible(hotel.getActif());
        return dto;
    }

    private HotelDTO convertToDetailDTO(Hotel hotel) {
        HotelDTO dto = new HotelDTO();
        dto.setId(hotel.getId());
        dto.setNom(hotel.getNom());
        dto.setDescription(hotel.getDescription());
        dto.setAdresse(hotel.getAdresse());
        dto.setVille(hotel.getVille());
        dto.setTelephone(hotel.getTelephone());
        dto.setEmail(hotel.getEmail());
        dto.setSiteWeb(hotel.getSiteWeb());
        dto.setEtoiles(hotel.getEtoiles());
        dto.setLatitude(hotel.getLatitude());
        dto.setLongitude(hotel.getLongitude());
        dto.setEquipements(hotel.getEquipements());
        dto.setImages(hotel.getImages());
        dto.setActif(hotel.getActif());
        dto.setPrixMinimum(calculateMinPrice(hotel));

        List<ChambreDTO> chambresDTO = hotel.getChambres().stream()
                .map(this::convertChambreToDTO)
                .collect(Collectors.toList());
        dto.setChambres(chambresDTO);

        return dto;
    }

    private ChambreDTO convertChambreToDTO(Chambre chambre) {
        ChambreDTO dto = new ChambreDTO();
        dto.setId(chambre.getId());
        dto.setNumero(chambre.getNumero());
        dto.setType(chambre.getType().name());
        dto.setNombreLits(chambre.getNombreLits());
        dto.setCapacitePersonnes(chambre.getCapacitePersonnes());
        dto.setPrixParNuit(chambre.getPrixParNuit());
        dto.setDescription(chambre.getDescription());
        dto.setSuperficie(chambre.getSuperficie());
        dto.setEquipements(chambre.getEquipements());
        dto.setImages(chambre.getImages());
        dto.setDisponible(chambre.getDisponible());
        return dto;
    }

    private BigDecimal calculateMinPrice(Hotel hotel) {
        return hotel.getChambres().stream()
                .map(Chambre::getPrixParNuit)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
    }

    private boolean hasRoomsWithinBudget(Hotel hotel, BigDecimal budget) {
        return hotel.getChambres().stream()
                .anyMatch(c -> c.getPrixParNuit().compareTo(budget) <= 0);
    }

    private void updateHotelFromExternal(Hotel existing, Hotel external) {
        existing.setNom(external.getNom());
        existing.setDescription(external.getDescription());
        existing.setAdresse(external.getAdresse());
        existing.setTelephone(external.getTelephone());
        existing.setEmail(external.getEmail());
        existing.setEtoiles(external.getEtoiles());
        existing.setEquipements(external.getEquipements());
        existing.setImages(external.getImages());
    }
}