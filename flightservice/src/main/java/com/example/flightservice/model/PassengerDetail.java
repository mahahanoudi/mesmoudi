package com.example.flightservice.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "passenger_details")
@Data
public class PassengerDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "reservation_id", nullable = false)
    private Integer reservationId;

    @Column(name = "passenger_index", nullable = false)
    private Integer passengerIndex;

    @Enumerated(EnumType.STRING)
    @Column(name = "passenger_type", length = 20, nullable = false)
    private PassengerType passengerType;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "nationality", nullable = false, length = 50)
    private String nationality;

    @Column(name = "cin", length = 20)
    private String cin;

    @Column(name = "passport", length = 50)
    private String passport;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "class_type", length = 20, nullable = false)
    private ClassType classType;

    @Column(name = "seat_number", length = 10)
    private String seatNumber;

    @Column(name = "special_requests", length = 500)
    private String specialRequests;

    @Column(name = "contact_email", length = 100)
    private String contactEmail;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "check_in_status", length = 20)
    private String checkInStatus = "NOT_CHECKED_IN";

    @Column(name = "boarding_pass_url", length = 500)
    private String boardingPassUrl;

    @Column(name = "baggage_count")
    private Integer baggageCount = 0;

    @Column(name = "has_priority_boarding")
    private Boolean hasPriorityBoarding = false;

    @Column(name = "lounge_access")
    private Boolean loungeAccess = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "document_verified")
    private Boolean documentVerified = false;

    @Column(name = "verified_by", length = 100)
    private String verifiedBy;

    @Column(name = "verification_date")
    private LocalDateTime verificationDate;

    @Column(name = "flight_class_id")
    private Integer flightClassId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flight_class_id", insertable = false, updatable = false)
    private FlightClass flightClass;

    // Relation avec Reservation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", referencedColumnName = "id", insertable = false, updatable = false)
    private Reservation reservation;

    public enum PassengerType {
        ADULTE("Adulte", 16, 120),
        ENFANT("Enfant", 2, 15),
        BEBE("Bébé", 0, 1);

        private final String label;
        private final int minAge;
        private final int maxAge;

        PassengerType(String label, int minAge, int maxAge) {
            this.label = label;
            this.minAge = minAge;
            this.maxAge = maxAge;
        }

        public String getLabel() {
            return label;
        }

        public int getMinAge() {
            return minAge;
        }

        public int getMaxAge() {
            return maxAge;
        }

        // Méthode utilitaire pour déterminer le type de passager basé sur l'âge
        public static PassengerType fromAge(int age) {
            if (age >= 16) return ADULTE;
            if (age >= 2 && age <= 15) return ENFANT;
            return BEBE;
        }

        // Méthode pour vérifier si l'âge est valide pour ce type
        public boolean isValidAge(int age) {
            return age >= minAge && age <= maxAge;
        }
    }

    // Méthode pour calculer l'âge à partir de la date de naissance
    @Transient
    public Integer getAge() {
        if (birthDate == null) {
            return null;
        }
        LocalDate today = LocalDate.now();
        return today.getYear() - birthDate.getYear() -
                (today.getDayOfYear() < birthDate.getDayOfYear() ? 1 : 0);
    }

    // Méthode pour vérifier si le passager est valide
    @Transient
    public boolean isValid() {
        if (firstName == null || firstName.trim().isEmpty()) {
            return false;
        }
        if (lastName == null || lastName.trim().isEmpty()) {
            return false;
        }
        if (nationality == null || nationality.trim().isEmpty()) {
            return false;
        }

        // Vérification des documents
        if ("marocaine".equalsIgnoreCase(nationality) && passengerType == PassengerType.ADULTE) {
            if (cin == null || cin.trim().isEmpty() || cin.length() != 8) {
                return false;
            }
        } else {
            if (passport == null || passport.trim().isEmpty() || passport.length() < 6) {
                return false;
            }
        }

        // Vérification de l'âge
        Integer age = getAge();
        if (age != null && !passengerType.isValidAge(age)) {
            return false;
        }

        return true;
    }

    // Méthode pour obtenir le nom complet
    @Transient
    public String getFullName() {
        return (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "");
    }

    // Méthode pour obtenir le type de document requis
    @Transient
    public String getRequiredDocument() {
        if ("marocaine".equalsIgnoreCase(nationality) && passengerType == PassengerType.ADULTE) {
            return "CIN";
        }
        return "PASSEPORT";
    }

    // Méthode pour obtenir le document actuel
    @Transient
    public String getCurrentDocument() {
        if (cin != null && !cin.trim().isEmpty()) {
            return "CIN: " + cin;
        }
        if (passport != null && !passport.trim().isEmpty()) {
            return "Passeport: " + passport;
        }
        return "Aucun document";
    }

    // Méthode pour vérifier si le passager est éligible au check-in
    @Transient
    public boolean isEligibleForCheckIn() {
        return "NOT_CHECKED_IN".equals(checkInStatus) && documentVerified;
    }

    // Méthode pour vérifier si le passager est éligible à l'embarquement prioritaire
    @Transient
    public boolean isEligibleForPriorityBoarding() {
        return hasPriorityBoarding ||
                classType == ClassType.BUSINESS ||
                classType == ClassType.FIRST ||
                passengerType == PassengerType.BEBE;
    }

    // Méthode pour initialiser les valeurs par défaut basées sur la classe
    public void initializeFromClass(ClassType classType) {
        this.classType = classType;

        // Initialiser les avantages selon la classe
        switch (classType) {
            case BUSINESS:
            case FIRST:
                this.hasPriorityBoarding = true;
                this.loungeAccess = true;
                this.baggageCount = classType == ClassType.FIRST ? 3 : 2;
                break;
            case PREMIUM:
                this.hasPriorityBoarding = true;
                this.baggageCount = 2;
                break;
            case ECONOMY:
            default:
                this.baggageCount = 1;
                break;
        }
    }

    // Méthode pour créer un résumé du passager
    @Transient
    public String getPassengerSummary() {
        return String.format("%s %s (%s, %s) - %s",
                firstName, lastName,
                nationality, passengerType.getLabel(),
                classType);
    }

    // Méthode pour vérifier si le passager est un adulte
    @Transient
    public boolean isAdult() {
        return passengerType == PassengerType.ADULTE;
    }

    // Méthode pour vérifier si le passager est un enfant
    @Transient
    public boolean isChild() {
        return passengerType == PassengerType.ENFANT;
    }

    // Méthode pour vérifier si le passager est un bébé
    @Transient
    public boolean isInfant() {
        return passengerType == PassengerType.BEBE;
    }

    // Méthode pour mettre à jour le statut de vérification des documents
    public void verifyDocument(String verifiedBy) {
        this.documentVerified = true;
        this.verifiedBy = verifiedBy;
        this.verificationDate = LocalDateTime.now();
    }

    // Méthode pour effectuer le check-in
    public boolean checkIn(String seatNumber) {
        if (isEligibleForCheckIn()) {
            this.seatNumber = seatNumber;
            this.checkInStatus = "CHECKED_IN";
            this.updatedAt = LocalDateTime.now();
            return true;
        }
        return false;
    }

    // Méthode pour générer un code de bagage
    @Transient
    public String generateBaggageTag() {
        if (reservationId == null || seatNumber == null) {
            return null;
        }
        return String.format("%s-%s-%s-%03d",
                reservationId,
                seatNumber,
                lastName.substring(0, Math.min(3, lastName.length())).toUpperCase(),
                baggageCount);
    }

    // Builder pattern pour une création facile
    public static PassengerDetailBuilder builder() {
        return new PassengerDetailBuilder();
    }

    public static class PassengerDetailBuilder {
        private PassengerDetail passengerDetail = new PassengerDetail();

        public PassengerDetailBuilder reservationId(Integer reservationId) {
            passengerDetail.setReservationId(reservationId);
            return this;
        }

        public PassengerDetailBuilder passengerIndex(Integer passengerIndex) {
            passengerDetail.setPassengerIndex(passengerIndex);
            return this;
        }

        public PassengerDetailBuilder passengerType(PassengerType passengerType) {
            passengerDetail.setPassengerType(passengerType);
            return this;
        }

        public PassengerDetailBuilder firstName(String firstName) {
            passengerDetail.setFirstName(firstName);
            return this;
        }

        public PassengerDetailBuilder lastName(String lastName) {
            passengerDetail.setLastName(lastName);
            return this;
        }

        public PassengerDetailBuilder nationality(String nationality) {
            passengerDetail.setNationality(nationality);
            return this;
        }

        public PassengerDetailBuilder cin(String cin) {
            passengerDetail.setCin(cin);
            return this;
        }

        public PassengerDetailBuilder passport(String passport) {
            passengerDetail.setPassport(passport);
            return this;
        }

        public PassengerDetailBuilder birthDate(LocalDate birthDate) {
            passengerDetail.setBirthDate(birthDate);
            return this;
        }

        public PassengerDetailBuilder classType(ClassType classType) {
            passengerDetail.setClassType(classType);
            return this;
        }

        public PassengerDetail build() {
            if (passengerDetail.getPassengerType() == null) {
                passengerDetail.setPassengerType(PassengerType.ADULTE);
            }
            if (passengerDetail.getClassType() == null) {
                passengerDetail.setClassType(ClassType.ECONOMY);
            }
            if (passengerDetail.getPassengerIndex() == null) {
                passengerDetail.setPassengerIndex(1);
            }
            passengerDetail.initializeFromClass(passengerDetail.getClassType());
            return passengerDetail;
        }
    }

    @Override
    public String toString() {
        return "PassengerDetail{" +
                "id=" + id +
                ", reservationId=" + reservationId +
                ", passengerIndex=" + passengerIndex +
                ", passengerType=" + passengerType +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", nationality='" + nationality + '\'' +
                ", classType=" + classType +
                ", seatNumber='" + seatNumber + '\'' +
                ", checkInStatus='" + checkInStatus + '\'' +
                ", documentVerified=" + documentVerified +
                '}';
    }
}