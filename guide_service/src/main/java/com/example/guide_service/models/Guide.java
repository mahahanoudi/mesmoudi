package com.example.guide_service.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "guides")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Guide {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    // On stocke seulement le nom du fichier (ex: "1_ahmed_benani.jpg")
    private String photoFileName;

    @NotNull(message = "L'âge est obligatoire")
    @Min(value = 18, message = "L'âge doit être d'au moins 18 ans")
    @Max(value = 100, message = "L'âge ne peut pas dépasser 100 ans")
    private Integer age;

    @NotBlank(message = "La nationalité est obligatoire")
    private String nationalite;

    @NotBlank(message = "Le CIN est obligatoire")
    @Column(unique = true)
    private String cin;

    @NotBlank(message = "La ville est obligatoire")
    private String ville;

    @NotBlank(message = "La région est obligatoire")
    private String region;

    // Stocker les langues sous forme de chaîne JSON
    @Column(columnDefinition = "TEXT")
    private String langues;

    @NotNull(message = "L'expérience est obligatoire")
    @Min(value = 0, message = "L'expérience ne peut pas être négative")
    private Integer experience;

    @NotBlank(message = "La description est obligatoire")
    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Le tarif horaire est obligatoire")
    @Positive(message = "Le tarif horaire doit être positif")
    private Double tarifHoraire;

    @NotNull(message = "Le tarif demi-journée est obligatoire")
    @Positive(message = "Le tarif demi-journée doit être positif")
    private Double tarifDemiJournee;

    @NotNull(message = "Le tarif journée est obligatoire")
    @Positive(message = "Le tarif journée doit être positif")
    private Double tarifJournee;

    @NotBlank(message = "Le téléphone est obligatoire")
    private String telephone;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "L'email doit être valide")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "L'adresse est obligatoire")
    private String adresse;

    private Boolean actif = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}