package com.tetouan.tourism.restaurant.dto;

import com.tetouan.tourism.restaurant.model.ReservationStatus;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDTO {

    private Long id;

    // User info
    @NotNull(message = "L'ID utilisateur est requis")
    private String userId;

    @NotBlank(message = "Le nom est requis")
    private String userName;

    @NotBlank(message = "L'email est requis")
    @Email(message = "Format d'email invalide")
    private String userEmail;

    private String userPhone;

    // Restaurant info
    @NotNull(message = "L'ID du restaurant est requis")
    private Long restaurantId;

    private String restaurantName; // For display in responses
    private String restaurantAddress;
    private String restaurantImage;

    // Reservation details
    @NotNull(message = "La date de réservation est requise")
    @Future(message = "La date doit être dans le futur")
    private LocalDate reservationDate;

    @NotNull(message = "L'heure de réservation est requise")
    private LocalTime reservationTime;

    @NotNull(message = "Le nombre de personnes est requis")
    @Min(value = 1, message = "Minimum 1 personne")
    @Max(value = 10, message = "Maximum 10 personnes")
    private Integer partySize;

    @Size(max = 500, message = "Les demandes spéciales ne peuvent pas dépasser 500 caractères")
    private String specialRequests;

    // Status
    private ReservationStatus status;
    private LocalDateTime createdAt;
}
