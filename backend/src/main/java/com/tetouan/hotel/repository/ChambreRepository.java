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
public interface ChambreRepository extends JpaRepository<Chambre, Long> {

    List<Chambre> findByHotelId(Long hotelId);

    List<Chambre> findByHotelIdAndDisponibleTrue(Long hotelId);

    @Query("SELECT c FROM Chambre c WHERE c.hotel.id = :hotelId AND c.prixParNuit <= :prixMax")
    List<Chambre> findByHotelAndPrixMax(@Param("hotelId") Long hotelId,
                                        @Param("prixMax") BigDecimal prixMax);

    Optional<Chambre> findByExternalId(String externalId);
}