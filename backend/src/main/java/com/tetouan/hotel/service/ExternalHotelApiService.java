package com.tetouan.hotel.service;

import com.tetouan.hotel.model.Hotel;
import com.tetouan.hotel.model.Chambre;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.time.Duration;
import java.util.List;

/**
 * Service pour intégrer l'API externe des hôtels de Tétouan
 * Ce service peut être adapté selon la structure réelle de l'API
 */
@Service
@Slf4j
public class ExternalHotelApiService {

    private final WebClient webClient;

    @Value("${external.api.hotels.base-url}")
    private String baseUrl;

    @Value("${external.api.hotels.timeout:5000}")
    private Integer timeout;

    public ExternalHotelApiService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    /**
     * Récupère tous les hôtels depuis l'API externe
     */
    public List<Hotel> fetchAllHotels() {
        try {
            log.info("Récupération des hôtels depuis l'API externe: {}", baseUrl);

            // Exemple d'appel API - à adapter selon l'API réelle
            List<Hotel> hotels = webClient.get()
                    .uri(baseUrl + "/api/hotels")
                    .retrieve()
                    .bodyToFlux(Hotel.class)
                    .timeout(Duration.ofMillis(timeout))
                    .collectList()
                    .block();

            log.info("Récupération réussie de {} hôtels", hotels != null ? hotels.size() : 0);
            return hotels;

        } catch (Exception e) {
            log.error("Erreur lors de la récupération des hôtels depuis l'API externe", e);
            return List.of();
        }
    }

    /**
     * Récupère un hôtel spécifique par son ID externe
     */
    public Mono<Hotel> fetchHotelById(String externalId) {
        try {
            log.info("Récupération de l'hôtel {} depuis l'API externe", externalId);

            return webClient.get()
                    .uri(baseUrl + "/api/hotels/" + externalId)
                    .retrieve()
                    .bodyToMono(Hotel.class)
                    .timeout(Duration.ofMillis(timeout))
                    .doOnSuccess(hotel -> log.info("Hôtel {} récupéré avec succès", externalId))
                    .doOnError(error -> log.error("Erreur lors de la récupération de l'hôtel {}", externalId, error));

        } catch (Exception e) {
            log.error("Erreur lors de la récupération de l'hôtel depuis l'API externe", e);
            return Mono.empty();
        }
    }

    /**
     * Récupère les chambres d'un hôtel depuis l'API externe
     */
    public List<Chambre> fetchHotelRooms(String hotelExternalId) {
        try {
            log.info("Récupération des chambres de l'hôtel {} depuis l'API externe", hotelExternalId);

            List<Chambre> chambres = webClient.get()
                    .uri(baseUrl + "/api/hotels/" + hotelExternalId + "/rooms")
                    .retrieve()
                    .bodyToFlux(Chambre.class)
                    .timeout(Duration.ofMillis(timeout))
                    .collectList()
                    .block();

            log.info("Récupération réussie de {} chambres", chambres != null ? chambres.size() : 0);
            return chambres;

        } catch (Exception e) {
            log.error("Erreur lors de la récupération des chambres depuis l'API externe", e);
            return List.of();
        }
    }

    /**
     * Vérifie la disponibilité auprès de l'API externe
     */
    public Boolean checkAvailability(String roomExternalId, String dateArrivee, String dateDepart) {
        try {
            log.info("Vérification de disponibilité pour la chambre {} du {} au {}",
                    roomExternalId, dateArrivee, dateDepart);

            Boolean available = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path(baseUrl + "/api/rooms/" + roomExternalId + "/availability")
                            .queryParam("checkIn", dateArrivee)
                            .queryParam("checkOut", dateDepart)
                            .build())
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .timeout(Duration.ofMillis(timeout))
                    .block();

            log.info("Disponibilité: {}", available);
            return available != null ? available : false;

        } catch (Exception e) {
            log.error("Erreur lors de la vérification de disponibilité", e);
            return false;
        }
    }
}