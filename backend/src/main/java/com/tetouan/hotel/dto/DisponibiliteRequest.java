package com.tetouan.hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

// DTO pour vérifier la disponibilité
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DisponibiliteRequest {
    private Long chambreId;
    private LocalDate dateArrivee;
    private LocalDate dateDepart;
}