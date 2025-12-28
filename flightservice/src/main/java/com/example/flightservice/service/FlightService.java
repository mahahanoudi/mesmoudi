package com.example.flightservice.service;

import com.example.flightservice.dto.FlightSearchDTO;
import com.example.flightservice.model.*;
import com.example.flightservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlightService {

    private final FlightRepository flightRepository;
    private final FlightClassRepository flightClassRepository;
    private final ReservationRepository reservationRepository;

    /**
     * Initialisation de la base de données (si vide)
     */
    @Transactional
    public void initializeDatabase() {
        log.info("🔄 Vérification de la base de données...");

        try {
            long flightCount = flightRepository.count();
            long classCount = flightClassRepository.count();

            log.info("État actuel: {} vols, {} classes dans la BD", flightCount, classCount);

            if (flightCount == 0) {
                log.info("⚠️ Base de données VIDE - Veuillez importer les données SQL fournies");
                log.info("📋 Utilisez les fichiers SQL fournis pour peupler la base de données");
            } else {
                log.info("✅ Base de données prête avec {} vols et {} classes", flightCount, classCount);
            }

        } catch (Exception e) {
            log.error("❌ Erreur vérification BD: {}", e.getMessage(), e);
        }
    }

    /**
     * Rechercher des vols depuis la BD
     */
    public List<FlightSearchDTO> searchFlights(String departureCity,
                                               LocalDate departureDate,
                                               String airline,
                                               Integer passengers,
                                               ClassType classType) {

        log.info("🔍 Recherche BD - Ville: {}, Date: {}, Compagnie: {}",
                departureCity, departureDate, airline);

        // Si pas de date spécifiée, utiliser aujourd'hui
        if (departureDate == null) {
            departureDate = LocalDate.now();
            log.info("Date non spécifiée, utilisation d'aujourd'hui: {}", departureDate);
        }

        List<Flight> flights;

        // Chercher dans la base de données par date
        LocalDateTime startOfDay = departureDate.atStartOfDay();
        LocalDateTime endOfDay = departureDate.atTime(23, 59, 59);
        flights = flightRepository.findByDepartureTimeBetween(startOfDay, endOfDay);

        log.info("📊 {} vols trouvés dans BD pour le {}", flights.size(), departureDate);

        // Filtrer par ville si spécifiée
        if (departureCity != null && !departureCity.isEmpty()) {
            List<Flight> filteredFlights = new ArrayList<>();
            for (Flight flight : flights) {
                if (flight.getDepartureCity() != null &&
                        flight.getDepartureCity().equalsIgnoreCase(departureCity)) {
                    filteredFlights.add(flight);
                }
            }
            flights = filteredFlights;
            log.info("Filtré par ville '{}': {} vols", departureCity, flights.size());
        }

        // Filtrer par compagnie si spécifiée
        if (airline != null && !airline.isEmpty()) {
            List<Flight> filteredFlights = new ArrayList<>();
            for (Flight flight : flights) {
                if (flight.getAirline() != null &&
                        flight.getAirline().equalsIgnoreCase(airline)) {
                    filteredFlights.add(flight);
                }
            }
            flights = filteredFlights;
            log.info("Filtré par compagnie '{}': {} vols", airline, flights.size());
        }

        // Convertir en DTO
        List<FlightSearchDTO> result = new ArrayList<>();
        for (Flight flight : flights) {
            try {
                FlightSearchDTO dto = convertToFlightSearchDTO(flight);
                result.add(dto);
            } catch (Exception e) {
                log.warn("Erreur conversion vol {}: {}", flight.getFlightNumber(), e.getMessage());
            }
        }

        // Trier par prix minimum
        result.sort(Comparator.comparing(FlightSearchDTO::getMinPrice));

        log.info("📊 {} vols retournés au frontend", result.size());
        return result;
    }

    /**
     * Convertir Flight de la BD en FlightSearchDTO - CORRIGÉ AVEC CALCUL DES PRIX
     */
    private FlightSearchDTO convertToFlightSearchDTO(Flight flight) {
        log.debug("Conversion Flight -> DTO pour le vol {}", flight.getFlightNumber());

        FlightSearchDTO dto = new FlightSearchDTO();
        dto.setId(flight.getId());
        dto.setFlightNumber(flight.getFlightNumber());
        dto.setAirline(flight.getAirline());
        dto.setDepartureCity(flight.getDepartureCity());
        dto.setDepartureCode(flight.getDepartureCode());
        dto.setDepartureTime(flight.getDepartureTime());
        dto.setArrivalTime(flight.getArrivalTime());
        dto.setDuration(flight.getDuration());
        dto.setStatus(flight.getStatus());
        dto.setAircraftType(flight.getAircraftType());

        // CORRECTION: Prix de base depuis flights.price
        Double basePrice = flight.getPrice();
        if (basePrice == null) {
            basePrice = 0.0;
            log.warn("⚠️ Prix de base null pour le vol {}, fixé à 0", flight.getFlightNumber());
        }
        dto.setBasePrice(basePrice);
        dto.setMinPrice(basePrice); // Initialiser avec le prix de base

        // Récupérer les classes depuis flight_class
        List<FlightClass> flightClasses = flightClassRepository.findByFlightId(flight.getId());
        log.debug("{} classes trouvées pour le vol {}", flightClasses.size(), flight.getFlightNumber());

        // Convertir en FlightClassInfo - AVEC CALCUL CORRECT DES PRIX
        List<FlightSearchDTO.FlightClassInfo> classInfos = new ArrayList<>();

        // Calculer le total des places disponibles
        Integer totalAvailableSeats = 0;

        for (FlightClass flightClass : flightClasses) {
            // Inclure seulement si availableSeats > 0
            if (flightClass.getAvailableSeats() != null && flightClass.getAvailableSeats() > 0) {
                FlightSearchDTO.FlightClassInfo info = new FlightSearchDTO.FlightClassInfo();
                info.setClassType(flightClass.getClassType());
                info.setAvailableSeats(flightClass.getAvailableSeats());

                // Prix de classe depuis flight_class.class_price
                Double classPrice = flightClass.getClassPrice();
                if (classPrice == null) {
                    classPrice = 0.0;
                }
                info.setClassPrice(classPrice);

                // CORRECTION: Prix total = basePrice + classPrice
                Double totalPrice = basePrice + classPrice;
                info.setTotalPrice(totalPrice);
                info.setCurrency(flight.getCurrency() != null ? flight.getCurrency() : "MAD");

                classInfos.add(info);
                totalAvailableSeats += flightClass.getAvailableSeats();

                // Mettre à jour minPrice si ce prix est plus bas
                if (totalPrice < dto.getMinPrice()) {
                    dto.setMinPrice(totalPrice);
                }

                log.debug("Classe {}: base={}, supplément={}, total={}, places={}",
                        flightClass.getClassType(), basePrice, classPrice, totalPrice,
                        flightClass.getAvailableSeats());
            }
        }

        dto.setClasses(classInfos);
        dto.setTotalAvailableSeats(totalAvailableSeats);

        log.info("✅ Conversion DTO pour {}: basePrice={}, minPrice={}, {} classes",
                flight.getFlightNumber(), basePrice, dto.getMinPrice(), classInfos.size());

        return dto;
    }

    /**
     * Obtenir les vols d'aujourd'hui depuis la BD
     */
    public List<FlightSearchDTO> getTodayFlights(Integer passengers, ClassType classType) {
        log.info("📅 Récupération des vols d'aujourd'hui depuis BD");
        return searchFlights(null, LocalDate.now(), null, passengers, classType);
    }

    /**
     * Obtenir les détails d'un vol depuis la BD
     */
    public FlightSearchDTO getFlightDetails(String flightId, ClassType classType) {
        log.info("🔎 Détails du vol {} depuis BD", flightId);

        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new RuntimeException("Vol non trouvé dans la BD"));

        FlightSearchDTO dto = convertToFlightSearchDTO(flight);

        // Filtrer par classe spécifique si demandé
        if (classType != null) {
            List<FlightSearchDTO.FlightClassInfo> filteredClasses = new ArrayList<>();
            for (FlightSearchDTO.FlightClassInfo classInfo : dto.getClasses()) {
                if (classInfo.getClassType() == classType) {
                    filteredClasses.add(classInfo);
                }
            }
            dto.setClasses(filteredClasses);
        }

        return dto;
    }

    /**
     * Réserver des places - AVEC CALCUL CORRECT DES PRIX
     */
    @Transactional
    public Reservation makeReservation(String flightId, Integer flightClassId,
                                       String userId, Integer passengers) {

        log.info("🎫 Réservation: vol {}, classe {}, {} passagers, utilisateur {}",
                flightId, flightClassId, passengers, userId);

        // Vérifier la disponibilité dans flight_class
        FlightClass flightClass = flightClassRepository.findById(flightClassId)
                .orElseThrow(() -> new RuntimeException("Classe non trouvée dans la BD"));

        if (flightClass.getAvailableSeats() < passengers) {
            throw new RuntimeException("Pas assez de places disponibles");
        }

        // Récupérer le vol depuis flights pour le prix
        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new RuntimeException("Vol non trouvé dans la BD"));

        // CORRECTION: Calculer le prix total avec le vrai calcul (base + supplément)
        Double basePrice = flight.getPrice() != null ? flight.getPrice() : 0.0;
        Double classPrice = flightClass.getClassPrice() != null ? flightClass.getClassPrice() : 0.0;
        Double pricePerPassenger = basePrice + classPrice;
        Double totalPrice = pricePerPassenger * passengers;

        log.info("💰 Calcul prix: base={}, class={}, par passager={}, total={}",
                basePrice, classPrice, pricePerPassenger, totalPrice);

        // Créer la réservation
        Reservation reservation = new Reservation();
        reservation.setUserId(userId);
        reservation.setFlightId(flightId);
        reservation.setFlightClassId(flightClassId);
        reservation.setPassengersCount(passengers);
        reservation.setTotalPrice(totalPrice);
        reservation.setStatus(ReservationStatus.CONFIRMED);

        reservation.setFlightClass(flightClass);
        Reservation savedReservation = reservationRepository.save(reservation);

        // Mettre à jour les places disponibles dans flight_class
        flightClass.setAvailableSeats(flightClass.getAvailableSeats() - passengers);
        flightClassRepository.save(flightClass);

        log.info("✅ Réservation {} créée avec succès", savedReservation.getId());

        return savedReservation;
    }

    /**
     * Statistiques depuis la BD
     */
    public Map<String, Object> getDashboardStats() {
        List<Flight> allFlights = flightRepository.findAll();

        Map<String, Object> stats = new HashMap<>();

        // Nombre total de vols
        stats.put("totalFlights", allFlights.size());

        // Vols aujourd'hui
        long todayFlights = 0;
        LocalDate today = LocalDate.now();
        for (Flight flight : allFlights) {
            if (flight.getDepartureTime() != null &&
                    flight.getDepartureTime().toLocalDate().equals(today)) {
                todayFlights++;
            }
        }
        stats.put("todayFlights", todayFlights);

        // Prix moyen, minimum et maximum depuis la colonne 'price'
        double sumPrice = 0;
        double minPrice = Double.MAX_VALUE;
        double maxPrice = 0;
        int countWithPrice = 0;

        for (Flight flight : allFlights) {
            if (flight.getPrice() != null) {
                double price = flight.getPrice();
                sumPrice += price;
                if (price < minPrice) minPrice = price;
                if (price > maxPrice) maxPrice = price;
                countWithPrice++;
            }
        }

        double avgPrice = countWithPrice > 0 ? sumPrice / countWithPrice : 0.0;
        stats.put("averagePrice", avgPrice);
        stats.put("minPrice", minPrice == Double.MAX_VALUE ? 0.0 : minPrice);
        stats.put("maxPrice", maxPrice);

        // Compagnies actives
        Set<String> airlines = new HashSet<>();
        for (Flight flight : allFlights) {
            if (flight.getAirline() != null) {
                airlines.add(flight.getAirline());
            }
        }
        stats.put("activeAirlines", airlines.size());

        // Ville la plus populaire
        String mostPopularCity = "N/A";
        long maxCityCount = 0;
        Map<String, Long> cityCount = new HashMap<>();

        for (Flight flight : allFlights) {
            if (flight.getDepartureCity() != null) {
                String city = flight.getDepartureCity();
                long count = cityCount.getOrDefault(city, 0L) + 1;
                cityCount.put(city, count);

                if (count > maxCityCount) {
                    maxCityCount = count;
                    mostPopularCity = city;
                }
            }
        }
        stats.put("mostPopularCity", mostPopularCity);

        // Nombre total de réservations
        long totalReservations = reservationRepository.count();
        stats.put("totalReservations", totalReservations);

        // Ajouter les prix des classes
        List<FlightClass> allClasses = flightClassRepository.findAll();
        double minClassPrice = Double.MAX_VALUE;
        double maxClassPrice = 0;
        for (FlightClass flightClass : allClasses) {
            if (flightClass.getClassPrice() != null) {
                double price = flightClass.getClassPrice();
                if (price < minClassPrice) minClassPrice = price;
                if (price > maxClassPrice) maxClassPrice = price;
            }
        }
        stats.put("minClassSupplement", minClassPrice == Double.MAX_VALUE ? 0.0 : minClassPrice);
        stats.put("maxClassSupplement", maxClassPrice);

        return stats;
    }

    /**
     * Obtenir toutes les villes de départ depuis la BD
     */
    public List<String> getAllDepartureCities() {
        List<Flight> allFlights = flightRepository.findAll();

        if (allFlights.isEmpty()) {
            return Arrays.asList("Paris", "Casablanca", "Rabat", "Tanger", "Fès");
        }

        Set<String> uniqueCities = new HashSet<>();
        for (Flight flight : allFlights) {
            if (flight.getDepartureCity() != null && !flight.getDepartureCity().isEmpty()) {
                uniqueCities.add(flight.getDepartureCity());
            }
        }

        List<String> cities = new ArrayList<>(uniqueCities);
        Collections.sort(cities);
        return cities;
    }

    /**
     * Obtenir toutes les compagnies aériennes depuis la BD
     */
    public List<String> getAllAirlines() {
        List<Flight> allFlights = flightRepository.findAll();

        if (allFlights.isEmpty()) {
            return Arrays.asList("Royal Air Maroc", "Air France", "Iberia", "Lufthansa");
        }

        Set<String> uniqueAirlines = new HashSet<>();
        for (Flight flight : allFlights) {
            if (flight.getAirline() != null && !flight.getAirline().isEmpty()) {
                uniqueAirlines.add(flight.getAirline());
            }
        }

        List<String> airlines = new ArrayList<>(uniqueAirlines);
        Collections.sort(airlines);
        return airlines;
    }

    public Map<String, Object> checkFlightAvailability(String flightId, ClassType classType, Integer passengers) {
        FlightClass flightClass = flightClassRepository.findByFlightIdAndClassType(flightId, classType);

        Map<String, Object> response = new HashMap<>();

        if (flightClass == null) {
            response.put("available", false);
            response.put("message", "Classe non disponible");
            return response;
        }

        boolean isAvailable = flightClass.getAvailableSeats() >= passengers;
        response.put("available", isAvailable);
        response.put("availableSeats", flightClass.getAvailableSeats());
        response.put("classPrice", flightClass.getClassPrice());

        if (!isAvailable) {
            response.put("message", "Seulement " + flightClass.getAvailableSeats() + " place(s) disponible(s)");
        }

        return response;
    }

    @Transactional
    public void updateSeatAvailability(Integer flightClassId, Integer passengers, boolean increase) {
        FlightClass flightClass = flightClassRepository.findById(flightClassId)
                .orElseThrow(() -> new RuntimeException("Classe non trouvée"));

        int newAvailableSeats;
        if (increase) {
            newAvailableSeats = flightClass.getAvailableSeats() + passengers;
        } else {
            newAvailableSeats = flightClass.getAvailableSeats() - passengers;

            if (newAvailableSeats < 0) {
                throw new RuntimeException("Pas assez de places disponibles");
            }
        }

        flightClass.setAvailableSeats(newAvailableSeats);
        flightClassRepository.save(flightClass);

        log.info("🔄 Places {}: {} -> {} (classe {})",
                increase ? "ajoutées" : "déduites",
                flightClass.getAvailableSeats(), newAvailableSeats,
                flightClass.getClassType());
    }

    /**
     * Obtenir tous les vols
     */
    public List<Flight> getAllFlights() {
        return flightRepository.findAll();
    }

    /**
     * Compter les vols
     */
    public long countFlights() {
        return flightRepository.count();
    }

    /**
     * Vérifier si un vol existe
     */
    public boolean flightExists(String flightId) {
        return flightRepository.existsById(flightId);
    }
}