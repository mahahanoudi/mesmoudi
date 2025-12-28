package com.tetouan.hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HotelSummaryDTO {
    private Long id;
    private String nom;
    private String adresse;
    private Integer etoiles;
    private String imageUrl;
    private BigDecimal prixMinimum;
    private Boolean disponible;
}

