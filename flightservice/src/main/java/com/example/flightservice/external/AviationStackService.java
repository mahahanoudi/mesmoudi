package com.example.flightservice.external;

import com.example.flightservice.config.AviationStackConfig;
import com.example.flightservice.model.Flight;
import com.example.flightservice.model.FlightStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AviationStackService {

    private final AviationStackConfig config;
    private final WebClient.Builder webClientBuilder;

    private static final DateTimeFormatter API_DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * Rechercher les vols arrivant à Tétouan
     */
    public List<Flight> searchFlightsToTetouan(String departureCity,
                                               String departureDate,
                                               String airline) {

        try {
            log.info("Recherche AviationStack - Ville: {}, Date: {}, Compagnie: {}",
                    departureCity, departureDate, airline);

            WebClient client = webClientBuilder.build();

            UriComponentsBuilder uriBuilder = UriComponentsBuilder
                    .fromHttpUrl(config.getBaseUrl() + "/flights")
                    .queryParam("access_key", config.getApiKey())
                    .queryParam("arr_iata", "TTU") // Changé de CDG à TTU pour Tétouan
                    .queryParam("limit", 50);

            // Filtres optionnels
            if (departureCity != null && !departureCity.isEmpty()) {
                String airportCode = getAirportCodeForCity(departureCity);
                if (airportCode != null) {
                    uriBuilder.queryParam("dep_iata", airportCode);
                }
            }

            if (departureDate != null && !departureDate.isEmpty()) {
                uriBuilder.queryParam("flight_date", departureDate);
            }

            if (airline != null && !airline.isEmpty()) {
                String airlineCode = getAirlineIataCode(airline);
                if (airlineCode != null) {
                    uriBuilder.queryParam("airline_iata", airlineCode);
                }
            }

            String url = uriBuilder.toUriString();
            log.debug("URL API: {}", url.replace(config.getApiKey(), "***"));

            Map<String, Object> response = client.get()
                    .uri(url)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            List<Flight> flights = parseFlights(response);
            log.info("{} vols trouvés", flights.size());

            return flights;

        } catch (Exception e) {
            log.error("Erreur API AviationStack", e);
            return getFallbackFlights(departureCity);
        }
    }

    /**
     * Obtenir les vols en temps réel
     */
    public List<Flight> getLiveFlightsTetouan() {
        try {
            log.info("Récupération vols temps réel Tétouan");

            WebClient client = webClientBuilder.build();

            String url = UriComponentsBuilder
                    .fromHttpUrl(config.getBaseUrl() + "/flights")
                    .queryParam("access_key", config.getApiKey())
                    .queryParam("arr_iata", "TTU")
                    .queryParam("flight_status", "active")
                    .queryParam("limit", 30)
                    .toUriString();

            Map<String, Object> response = client.get()
                    .uri(url)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            List<Flight> flights = parseFlights(response);
            log.info("{} vols temps réel trouvés", flights.size());

            return flights;

        } catch (Exception e) {
            log.error("Erreur vols temps réel", e);
            return getFallbackFlights("live");
        }
    }

    /**
     * Obtenir les vols programmés
     */
    public List<Flight> getScheduledFlightsTetouan(int daysAhead) {
        try {
            log.info("Récupération vols programmés pour {} jours", daysAhead);

            List<Flight> allFlights = new ArrayList<>();

            for (int i = 0; i < daysAhead; i++) {
                String date = LocalDateTime.now()
                        .plusDays(i)
                        .format(API_DATE_FORMATTER);

                WebClient client = webClientBuilder.build();

                String url = UriComponentsBuilder
                        .fromHttpUrl(config.getBaseUrl() + "/flights")
                        .queryParam("access_key", config.getApiKey())
                        .queryParam("arr_iata", "TTU")
                        .queryParam("flight_date", date)
                        .queryParam("limit", 20)
                        .toUriString();

                Map<String, Object> response = client.get()
                        .uri(url)
                        .accept(MediaType.APPLICATION_JSON)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .block();

                allFlights.addAll(parseFlights(response));
            }

            log.info("{} vols programmés trouvés", allFlights.size());
            return allFlights;

        } catch (Exception e) {
            log.error("Erreur vols programmés", e);
            return getFallbackFlights("scheduled");
        }
    }

    /**
     * Parser la réponse AviationStack
     */
    @SuppressWarnings("unchecked")
    private List<Flight> parseFlights(Map<String, Object> response) {
        List<Flight> flights = new ArrayList<>();

        try {
            if (response == null || !response.containsKey("data")) {
                log.warn("Réponse API invalide ou vide");
                return flights;
            }

            List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");

            if (data == null || data.isEmpty()) {
                log.info("Aucun vol dans la réponse");
                return flights;
            }

            for (Map<String, Object> flightData : data) {
                try {
                    Flight flight = parseSingleFlight(flightData);
                    if (flight != null) {
                        flights.add(flight);
                    }
                } catch (Exception e) {
                    log.warn("Erreur parsing vol: {}", e.getMessage());
                }
            }

        } catch (Exception e) {
            log.error("Erreur parsing réponse API", e);
        }

        return flights;
    }

    /**
     * Parser un seul vol
     */
    @SuppressWarnings("unchecked")
    private Flight parseSingleFlight(Map<String, Object> flightData) {
        Flight flight = new Flight();

        try {
            // ID unique
            flight.setId(UUID.randomUUID().toString());

            // Informations de vol
            Map<String, Object> flightInfo = (Map<String, Object>) flightData.get("flight");
            if (flightInfo != null) {
                flight.setFlightNumber(flightInfo.getOrDefault("number", "N/A").toString());
                flight.setAircraftType(flightInfo.getOrDefault("iata", "Unknown").toString());
            }

            // Compagnie aérienne
            Map<String, Object> airlineInfo = (Map<String, Object>) flightData.get("airline");
            if (airlineInfo != null) {
                flight.setAirline(airlineInfo.getOrDefault("name", "Unknown").toString());
            }

            // Départ
            Map<String, Object> departure = (Map<String, Object>) flightData.get("departure");
            if (departure != null) {
                flight.setDepartureAirport(departure.getOrDefault("airport", "Unknown").toString());
                flight.setDepartureCode(departure.getOrDefault("iata", "UNK").toString());

                // Extraire la ville du timezone
                String timezone = departure.getOrDefault("timezone", "").toString();
                if (timezone.contains("/")) {
                    String city = timezone.split("/")[1].replace("_", " ");
                    flight.setDepartureCity(city);
                } else {
                    flight.setDepartureCity("Unknown City");
                }

                // Heure de départ
                String scheduledDeparture = departure.getOrDefault("scheduled", "").toString();
                if (!scheduledDeparture.isEmpty()) {
                    flight.setDepartureTime(parseDateTime(scheduledDeparture));
                }
            }

            // Arrivée à Tétouan
            Map<String, Object> arrival = (Map<String, Object>) flightData.get("arrival");
            if (arrival != null) {
                flight.setArrivalTime(parseDateTime(arrival.getOrDefault("scheduled", "").toString()));
            } else {
                // Si pas d'arrivée, estimer basé sur le départ
                if (flight.getDepartureTime() != null) {
                    flight.setArrivalTime(flight.getDepartureTime().plusHours(3));
                }
            }

            // Statut
            String apiStatus = flightData.getOrDefault("flight_status", "scheduled").toString();
            flight.setStatus(mapFlightStatus(apiStatus));

            // Prix de base simulé (REMPLACÉ setPrice() par setBasePrice())
            flight.setBasePrice(calculateSimulatedPrice(flight.getDepartureCity()));
            flight.setCurrency("MAD");
            // Note: availableSeats est maintenant géré dans FlightClass, pas dans Flight
            // flight.setAvailableSeats(new Random().nextInt(50) + 10);

            // Durée
            if (flight.getDepartureTime() != null && flight.getArrivalTime() != null) {
                long durationMinutes = java.time.Duration.between(
                        flight.getDepartureTime(), flight.getArrivalTime()
                ).toMinutes();
                flight.setDuration((int) durationMinutes);
            } else {
                flight.setDuration(180); // Durée par défaut
            }

            // Métadonnées
            flight.setDataSource("AVIATIONSTACK");
            flight.setLastUpdated(LocalDateTime.now());

            return flight;

        } catch (Exception e) {
            log.error("Erreur détaillée parsing vol", e);
            return null;
        }
    }

    /**
     * Parse datetime
     */
    private LocalDateTime parseDateTime(String dateTimeStr) {
        try {
            if (dateTimeStr == null || dateTimeStr.isEmpty()) {
                return LocalDateTime.now().plusDays(1);
            }
            return LocalDateTime.parse(dateTimeStr.substring(0, 19));
        } catch (Exception e) {
            log.warn("Erreur parsing datetime: {}", dateTimeStr);
            return LocalDateTime.now().plusDays(1);
        }
    }

    /**
     * Mapper les statuts
     */
    private FlightStatus mapFlightStatus(String apiStatus) {
        switch (apiStatus.toLowerCase()) {
            case "active": return FlightStatus.IN_FLIGHT;
            case "scheduled": return FlightStatus.SCHEDULED;
            case "landed": return FlightStatus.LANDED;
            case "cancelled": return FlightStatus.CANCELLED;
            case "diverted": return FlightStatus.DIVERTED;
            case "boarding": return FlightStatus.BOARDING;
            default: return FlightStatus.SCHEDULED;
        }
    }

    /**
     * Calcul prix de base simulé
     */
    private Double calculateSimulatedPrice(String departureCity) {
        if (departureCity == null) return 800.0;

        String cityLower = departureCity.toLowerCase();

        if (cityLower.contains("paris")) return 1200.0;
        if (cityLower.contains("casablanca")) return 450.0;
        if (cityLower.contains("madrid")) return 850.0;
        if (cityLower.contains("barcelone")) return 950.0;
        if (cityLower.contains("lisbonne")) return 780.0;
        if (cityLower.contains("londres")) return 1100.0;
        if (cityLower.contains("rome")) return 1000.0;
        if (cityLower.contains("rabat")) return 400.0;
        if (cityLower.contains("tanger")) return 300.0;
        if (cityLower.contains("fès") || cityLower.contains("fes")) return 350.0;
        if (cityLower.contains("marrakech")) return 500.0;

        return 600.0 + new Random().nextDouble() * 400;
    }

    /**
     * Code aéroport pour ville
     */
    private String getAirportCodeForCity(String city) {
        if (city == null) return null;

        String cityLower = city.toLowerCase();

        if (cityLower.contains("paris")) return "CDG";
        if (cityLower.contains("casablanca")) return "CMN";
        if (cityLower.contains("rabat")) return "RBA";
        if (cityLower.contains("tanger")) return "TNG";
        if (cityLower.contains("fès") || cityLower.contains("fes")) return "FEZ";
        if (cityLower.contains("marrakech")) return "RAK";
        if (cityLower.contains("agadir")) return "AGA";
        if (cityLower.contains("oujda")) return "OUD";
        if (cityLower.contains("madrid")) return "MAD";
        if (cityLower.contains("barcelone")) return "BCN";
        if (cityLower.contains("lisbonne")) return "LIS";
        if (cityLower.contains("londres")) return "LHR";
        if (cityLower.contains("rome")) return "FCO";
        if (cityLower.contains("berlin")) return "BER";
        if (cityLower.contains("amsterdam")) return "AMS";
        if (cityLower.contains("bruxelles")) return "BRU";
        if (cityLower.contains("al hoceima")) return "AHU";
        if (cityLower.contains("dakhla")) return "VIL";
        if (cityLower.contains("laayoune")) return "EUN";

        // Code par défaut: 3 premières lettres
        return city.substring(0, Math.min(3, city.length())).toUpperCase();
    }

    /**
     * Code IATA compagnie
     */
    private String getAirlineIataCode(String airlineName) {
        if (airlineName == null) return null;

        String airlineLower = airlineName.toLowerCase();

        if (airlineLower.contains("royal air maroc")) return "AT";
        if (airlineLower.contains("air france")) return "AF";
        if (airlineLower.contains("iberia")) return "IB";
        if (airlineLower.contains("lufthansa")) return "LH";
        if (airlineLower.contains("british airways")) return "BA";
        if (airlineLower.contains("tap air portugal")) return "TP";
        if (airlineLower.contains("ryanair")) return "FR";
        if (airlineLower.contains("easyjet")) return "U2";
        if (airlineLower.contains("air arabia maroc")) return "3O";
        if (airlineLower.contains("air mediterranee")) return "ML";

        return null;
    }

    /**
     * Données de fallback
     */
    private List<Flight> getFallbackFlights(String type) {
        log.warn("Utilisation données fallback pour: {}", type);

        List<Flight> fallbackFlights = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        // Vols fallback de base
        String[] cities = {"Paris", "Casablanca", "Madrid", "Barcelone", "Lisbonne"};
        String[] airlines = {"Royal Air Maroc", "Air France", "Iberia", "Ryanair", "Air Arabia Maroc"};

        Random random = new Random();

        for (int i = 0; i < 10; i++) {
            Flight flight = new Flight();
            flight.setId("FALLBACK-" + UUID.randomUUID().toString());
            flight.setFlightNumber("FB" + (1000 + i));
            flight.setAirline(airlines[random.nextInt(airlines.length)]);
            flight.setDepartureCity(cities[random.nextInt(cities.length)]);
            flight.setDepartureAirport(flight.getDepartureCity() + " Airport");
            flight.setDepartureCode(getAirportCodeForCity(flight.getDepartureCity()));
            flight.setDepartureTime(now.plusDays(random.nextInt(7) + 1));
            flight.setArrivalTime(flight.getDepartureTime().plusHours(2 + random.nextInt(4)));

            // CORRECTION: Utiliser setBasePrice() au lieu de setPrice()
            flight.setBasePrice(400.0 + random.nextDouble() * 800);

            // Supprimé car availableSeats est géré dans FlightClass
            // flight.setAvailableSeats(20 + random.nextInt(40));

            flight.setDuration(120 + random.nextInt(180));
            flight.setStatus(FlightStatus.SCHEDULED);
            flight.setDataSource("FALLBACK");
            flight.setLastUpdated(now);

            fallbackFlights.add(flight);
        }

        return fallbackFlights;
    }
}