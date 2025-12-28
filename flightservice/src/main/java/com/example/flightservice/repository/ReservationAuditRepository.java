package com.example.flightservice.repository;

import com.example.flightservice.model.ReservationAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReservationAuditRepository extends JpaRepository<ReservationAudit, Integer> {
    List<ReservationAudit> findByReservationIdOrderByChangedAtDesc(Integer reservationId);
}