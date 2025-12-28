package com.tetouan.hotel.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO pour mettre à jour le statut
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStatutRequest {
    @NotBlank(message = "Le statut est obligatoire")
    private String statut;
}