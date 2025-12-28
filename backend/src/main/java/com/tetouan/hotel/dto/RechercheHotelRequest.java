package com.tetouan.hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RechercheHotelRequest {
    private LocalDate dateArrivee;
    private LocalDate dateDepart;
    private Integer nombrePersonnes;
    private Integer nombreChambres;
    private Integer etoilesMin;
    private BigDecimal budgetMax;
    private List<String> equipements;
}