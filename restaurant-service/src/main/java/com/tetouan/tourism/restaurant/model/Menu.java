package com.tetouan.tourism.restaurant.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.ToString;

@Entity
@Data
@ToString(exclude = "restaurant")
public class Menu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomPlat;
    private String description;
    private Double prix;
    private String imageUrl; // Photo du plat

    @ManyToOne
    @JoinColumn(name = "restaurant_id")
    @JsonIgnore // Eviter boucle infinie JSON
    private Restaurant restaurant;
}
