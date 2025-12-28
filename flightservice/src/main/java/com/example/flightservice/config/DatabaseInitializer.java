package com.example.flightservice.config;

import com.example.flightservice.service.FlightService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitializer {

    private final FlightService flightService;

    @Bean
    public CommandLineRunner initializeDatabase() {
        return args -> {
            log.info("🚀 Démarrage de l'initialisation de la base de données...");

            try {
                flightService.initializeDatabase();
                log.info("✅ Base de données initialisée avec succès");
            } catch (Exception e) {
                log.error("❌ Erreur lors de l'initialisation de la base de données: {}", e.getMessage());
            }
        };
    }
}