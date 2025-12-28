package com.tetouan.hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDTO {
    private Long id;
    private String numeroReservation;
    private Long chambreId;
    private String chambreNumero;
    private String hotelNom;
    private String clientNom;
    private String clientPrenom;
    private String clientEmail;
    private String clientTelephone;
    private LocalDate dateArrivee;
    private LocalDate dateDepart;
    private Integer nombreNuits;
    private Integer nombreAdultes;
    private Integer nombreEnfants;
    private BigDecimal prixTotal;
    private BigDecimal acompteVerse;
    private String statut;
    private String demandesSpeciales;
}