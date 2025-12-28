package com.tetouan.hotel.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

// DTO pour créer une réservation
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReservationRequest {

    @NotNull(message = "L'ID de la chambre est obligatoire")
    private Long chambreId;

    @NotBlank(message = "Le nom du client est obligatoire")
    private String clientNom;

    @NotBlank(message = "Le prénom du client est obligatoire")
    private String clientPrenom;

    @NotBlank(message = "L'email du client est obligatoire")
    @Email(message = "Email invalide")
    private String clientEmail;

    @NotBlank(message = "Le téléphone du client est obligatoire")
    private String clientTelephone;

    private String clientAdresse;

    @NotNull(message = "La date d'arrivée est obligatoire")
    @Future(message = "La date d'arrivée doit être dans le futur")
    private LocalDate dateArrivee;

    @NotNull(message = "La date de départ est obligatoire")
    @Future(message = "La date de départ doit être dans le futur")
    private LocalDate dateDepart;

    @NotNull(message = "Le nombre d'adultes est obligatoire")
    @Min(value = 1, message = "Au moins un adulte est requis")
    private Integer nombreAdultes;

    @Min(value = 0, message = "Le nombre d'enfants ne peut pas être négatif")
    private Integer nombreEnfants = 0;

    private String demandesSpeciales;
}