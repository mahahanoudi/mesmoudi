package com.tetouan.hotel.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DisponibiliteResponse {
    private Boolean disponible;
    private String message;
    private BigDecimal prixTotal;
}