package com.example.guide_service.repository;


import com.example.guide_service.models.Guide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GuideRepository extends JpaRepository<Guide, Long> {

    Optional<Guide> findByCin(String cin);

    Optional<Guide> findByEmail(String email);

    boolean existsByCin(String cin);

    boolean existsByEmail(String email);

    List<Guide> findByActifTrue();

    List<Guide> findByVilleIgnoreCase(String ville);

    List<Guide> findByRegionIgnoreCase(String region);
}