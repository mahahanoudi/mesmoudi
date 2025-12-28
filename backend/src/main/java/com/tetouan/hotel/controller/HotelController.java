package com.tetouan.hotel.controller;

import com.tetouan.hotel.dto.*;
import com.tetouan.hotel.service.HotelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
@Slf4j
public class HotelController {

    private final HotelService hotelService;

    /**
     * GET /api/hotels
     * Récupère tous les hôtels de Tétouan
     */
    @GetMapping
    public ResponseEntity<List<HotelSummaryDTO>> getAllHotels() {
        log.info("GET /api/hotels - Récupération de tous les hôtels");
        List<HotelSummaryDTO> hotels = hotelService.getAllHotels();
        return ResponseEntity.ok(hotels);
    }

    /**
     * GET /api/hotels/{id}
     * Récupère un hôtel par son ID avec tous les détails
     */
    @GetMapping("/{id}")
    public ResponseEntity<HotelDTO> getHotelById(@PathVariable Long id) {
        log.info("GET /api/hotels/{} - Récupération d'un hôtel", id);
        HotelDTO hotel = hotelService.getHotelById(id);
        return ResponseEntity.ok(hotel);
    }

    /**
     * POST /api/hotels/search
     * Recherche d'hôtels selon des critères
     */
    @PostMapping("/search")
    public ResponseEntity<List<HotelSummaryDTO>> searchHotels(
            @RequestBody RechercheHotelRequest request) {
        log.info("POST /api/hotels/search - Recherche d'hôtels avec critères");
        List<HotelSummaryDTO> hotels = hotelService.searchHotels(request);
        return ResponseEntity.ok(hotels);
    }

    /**
     * GET /api/hotels/{id}/chambres
     * Récupère les chambres disponibles d'un hôtel
     */
    @GetMapping("/{id}/chambres")
    public ResponseEntity<List<ChambreDTO>> getAvailableRooms(@PathVariable Long id) {
        log.info("GET /api/hotels/{}/chambres - Récupération des chambres", id);
        List<ChambreDTO> chambres = hotelService.getAvailableRooms(id);
        return ResponseEntity.ok(chambres);
    }

    /**
     * POST /api/hotels/synchronize
     * Synchronise les hôtels depuis l'API externe
     */
    @PostMapping("/synchronize")
    public ResponseEntity<String> synchronizeHotels() {
        log.info("POST /api/hotels/synchronize - Synchronisation depuis l'API externe");
        hotelService.synchronizeHotelsFromExternalApi();
        return ResponseEntity.ok("Synchronisation réussie");
    }
}