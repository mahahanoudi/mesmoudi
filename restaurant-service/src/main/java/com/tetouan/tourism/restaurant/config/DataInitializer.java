package com.tetouan.tourism.restaurant.config;

import com.tetouan.tourism.restaurant.model.Menu;
import com.tetouan.tourism.restaurant.model.Restaurant;
import com.tetouan.tourism.restaurant.repository.MenuRepository;
import com.tetouan.tourism.restaurant.repository.RestaurantRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(RestaurantRepository restaurantRepository, MenuRepository menuRepository) {
        return args -> {
            if (restaurantRepository.count() == 0) {
                // Restaurant 1: El Reducto
                Restaurant r1 = new Restaurant();
                r1.setNom("El Reducto");
                r1.setDescription("Cuisine marocaine et espagnole raffinée dans un riad historique de la médina.");
                r1.setAdresse("Zankat Zawya 38, Tetouan Medina");
                r1.setTelephone("+212 539 96 81 20");
                r1.setImageUrl("/images/restaurants/el_reducto.png");
                r1.setLatitude(35.572);
                r1.setLongitude(-5.367);
                restaurantRepository.save(r1);

                Menu m1 = new Menu();
                m1.setNomPlat("Tajine de Poulet aux Citrons Confits");
                m1.setDescription("Poulet fermier mijoté avec olives et citrons confits maison.");
                m1.setPrix(85.0);
                m1.setRestaurant(r1);
                menuRepository.save(m1);

                Menu m2 = new Menu();
                m2.setNomPlat("Pastilla aux Fruits de Mer");
                m2.setDescription("Feuilleté croustillant farci aux crevettes, calamars et poisson blanc.");
                m2.setPrix(110.0);
                m2.setRestaurant(r1);
                menuRepository.save(m2);

                // Restaurant 2: La Union
                Restaurant r2 = new Restaurant();
                r2.setNom("Restaurante La Union");
                r2.setDescription("Un classique de Tétouan, ambiance conviviale et plats copieux.");
                r2.setAdresse("Medina, Tetouan");
                r2.setTelephone("+212 661 12 34 56");
                r2.setImageUrl("/images/restaurants/la_union.png");
                r2.setLatitude(35.570);
                r2.setLongitude(-5.365);
                restaurantRepository.save(r2);

                // Restaurant 3: Blanco Riad
                Restaurant r3 = new Restaurant();
                r3.setNom("Blanco Riad Restaurant");
                r3.setDescription("Cadre élégant et cuisine gastronomique au cœur de la ville.");
                r3.setAdresse("25 Rue Zawiya, Tetouan");
                r3.setTelephone("+212 539 70 00 00");
                r3.setImageUrl("/images/restaurants/blanco_riad.png");
                r3.setLatitude(35.571);
                r3.setLongitude(-5.366);
                restaurantRepository.save(r3);

                System.out.println(">>> Base de données Restaurant initialisée avec succès !");
            }
        };
    }
}
