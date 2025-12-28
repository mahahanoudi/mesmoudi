package com.tetouan.hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

// DTO pour une chambre
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChambreDTO {
    private Long id;
    private String numero;
    private String type;
    private Integer nombreLits;
    private Integer capacitePersonnes;
    private BigDecimal prixParNuit;
    private String description;
    private Double superficie;
    private List<String> equipements;
    private List<String> images;
    private Boolean disponible;
}