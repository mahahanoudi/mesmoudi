package com.example.flightservice.dto;

import com.example.flightservice.model.ClassType;
import com.example.flightservice.model.PassengerDetail;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ReservationDTO {
    private String userId;
    private String flightId;

    private ClassType classType;
    private Integer passengersCount;
    private List<PassengerInfo> passengers;
    private Double totalPrice;
    private String status = "PENDING";
    private LocalDateTime reservationDate;

    @Data
    public static class PassengerInfo {
        private PassengerDetail.PassengerType passengerType;
        private String firstName;
        private String lastName;
        private String nationality;
        private String cin;
        private String passport;
        private String birthDate;

        private ClassType classType; // AJOUTEZ CE CHAMP
        private Integer flightClassId;

        public void setClassType(ClassType classType) {
            this.classType = classType;
        }

        public void setFlightClassId(Integer flightClassId) {
            this.flightClassId = flightClassId;
        }

        // AJOUTEZ CES GETTERS
        public ClassType getClassType() {
            return classType;
        }

        public Integer getFlightClassId() {
            return flightClassId;
        }
    }
}