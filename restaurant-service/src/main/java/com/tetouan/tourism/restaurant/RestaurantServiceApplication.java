package com.tetouan.tourism.restaurant;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.boot.autoconfigure.domain.EntityScan(basePackages = "com.tetouan.tourism.restaurant.model")
@org.springframework.data.jpa.repository.config.EnableJpaRepositories(basePackages = "com.tetouan.tourism.restaurant.repository")
public class RestaurantServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(RestaurantServiceApplication.class, args);
    }

}
