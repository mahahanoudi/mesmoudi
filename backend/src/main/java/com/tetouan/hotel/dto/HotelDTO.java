package com.tetouan.hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

// DTO pour la réponse détaillée d'un hôtel
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HotelDTO {
    private Long id;
    private String nom;
    private String description;
    private String adresse;
    private String ville;
    private String telephone;
    private String email;
    private String siteWeb;
    private Integer etoiles;
    private Double latitude;
    private Double longitude;
    private List<String> equipements;
    private List<String> images;
    private List<ChambreDTO> chambres;
    private BigDecimal prixMinimum;
    private Boolean actif;
}

// DTO pour liste d'hôtels (vue simplifiée)



// DTO pour la recherche d'hôtels



