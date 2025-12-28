package com.tetouan.hotel.repository;

import com.tetouan.hotel.model.Hotel;
import com.tetouan.hotel.model.Chambre;
import com.tetouan.hotel.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    Optional<Hotel> findByExternalId(String externalId);

    List<Hotel> findByVilleAndActifTrue(String ville);

    List<Hotel> findByEtoilesGreaterThanEqualAndActifTrue(Integer etoiles);

    @Query("SELECT h FROM Hotel h WHERE h.actif = true AND h.ville = :ville")
    List<Hotel> findActiveHotelsInCity(@Param("ville") String ville);
}

