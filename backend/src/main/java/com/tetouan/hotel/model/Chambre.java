package com.tetouan.hotel.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chambres")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Chambre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String externalId; // ID de l'API externe

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @Column(nullable = false)
    private String numero;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TypeChambre type; // SIMPLE, DOUBLE, SUITE, FAMILIALE

    @Column(name = "nombre_lits", nullable = false)
    private Integer nombreLits;

    @Column(name = "capacite_personnes", nullable = false)
    private Integer capacitePersonnes;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal prixParNuit;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Double superficie; // en m²

    @ElementCollection
    @CollectionTable(name = "chambre_equipements", joinColumns = @JoinColumn(name = "chambre_id"))
    @Column(name = "equipement")
    private List<String> equipements = new ArrayList<>(); // Climatisation, TV, Minibar, etc.

    @ElementCollection
    @CollectionTable(name = "chambre_images", joinColumns = @JoinColumn(name = "chambre_id"))
    @Column(name = "image_url")
    private List<String> images = new ArrayList<>();

    @Column(nullable = false)
    private Boolean disponible = true;

    @OneToMany(mappedBy = "chambre", cascade = CascadeType.ALL)
    private List<Reservation> reservations = new ArrayList<>();

    public enum TypeChambre {
        SIMPLE, DOUBLE, SUITE, FAMILIALE, DELUXE
    }
}