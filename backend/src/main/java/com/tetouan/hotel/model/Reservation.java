package com.tetouan.hotel.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numeroReservation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chambre_id", nullable = false)
    private Chambre chambre;

    // Informations client (peut être lié à un service utilisateur externe)
    @Column(nullable = false)
    private String clientNom;

    @Column(nullable = false)
    private String clientPrenom;

    @Column(nullable = false)
    private String clientEmail;

    @Column(nullable = false)
    private String clientTelephone;

    private String clientAdresse;

    // Dates de réservation
    @Column(name = "date_arrivee", nullable = false)
    private LocalDate dateArrivee;

    @Column(name = "date_depart", nullable = false)
    private LocalDate dateDepart;

    @Column(name = "nombre_nuits", nullable = false)
    private Integer nombreNuits;

    @Column(name = "nombre_adultes", nullable = false)
    private Integer nombreAdultes;

    @Column(name = "nombre_enfants")
    private Integer nombreEnfants = 0;

    // Prix et paiement
    @Column(name = "prix_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal prixTotal;

    @Column(name = "acompte_verse", precision = 10, scale = 2)
    private BigDecimal acompteVerse;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private StatutReservation statut;

    @Column(length = 1000)
    private String demandesSpeciales;

    // Métadonnées
    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @Column(name = "date_annulation")
    private LocalDateTime dateAnnulation;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        dateModification = LocalDateTime.now();
        if (numeroReservation == null) {
            numeroReservation = "RES-" + System.currentTimeMillis();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        dateModification = LocalDateTime.now();
    }

    public enum StatutReservation {
        EN_ATTENTE,      // En attente de confirmation
        CONFIRMEE,       // Confirmée
        ANNULEE,         // Annulée
        TERMINEE,        // Terminée
        EN_COURS         // En cours (client à l'hôtel)
    }
}