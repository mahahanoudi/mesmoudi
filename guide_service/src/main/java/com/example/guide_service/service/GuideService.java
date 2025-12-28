package com.example.guide_service.service;

import com.example.guide_service.models.Guide;
import com.example.guide_service.repository.GuideRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class GuideService {

    private final GuideRepository guideRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public Guide createGuide(Guide guide) {
        log.info("🆕 Création guide: {} {}", guide.getPrenom(), guide.getNom());

        // Vérifier CIN unique
        if (guideRepository.existsByCin(guide.getCin())) {
            throw new RuntimeException("Un guide avec ce CIN existe déjà");
        }

        // Vérifier email unique
        if (guideRepository.existsByEmail(guide.getEmail())) {
            throw new RuntimeException("Un guide avec cet email existe déjà");
        }

        Guide savedGuide = guideRepository.save(guide);
        log.info("✅ Guide créé: ID = {}", savedGuide.getId());

        return savedGuide;
    }

    @Transactional
    public Guide updateGuide(Long id, Guide guideDetails) {
        log.info("✏️ Mise à jour guide ID: {}", id);

        Guide guide = getGuideById(id);

        // Vérifier CIN unique (sauf pour le guide actuel)
        if (!guide.getCin().equals(guideDetails.getCin()) &&
                guideRepository.existsByCin(guideDetails.getCin())) {
            throw new RuntimeException("Ce CIN est déjà utilisé");
        }

        // Vérifier email unique (sauf pour le guide actuel)
        if (!guide.getEmail().equals(guideDetails.getEmail()) &&
                guideRepository.existsByEmail(guideDetails.getEmail())) {
            throw new RuntimeException("Cet email est déjà utilisé");
        }

        // Si nouvelle image, supprimer l'ancienne
        if (guideDetails.getPhotoFileName() != null &&
                !guideDetails.getPhotoFileName().equals(guide.getPhotoFileName())) {
            try {
                fileStorageService.deleteFile(guide.getPhotoFileName());
            } catch (Exception e) {
                log.warn("⚠️ Impossible de supprimer l'ancienne image: {}", e.getMessage());
            }
        }

        // Mise à jour des champs
        guide.setNom(guideDetails.getNom());
        guide.setPrenom(guideDetails.getPrenom());
        guide.setPhotoFileName(guideDetails.getPhotoFileName());
        guide.setAge(guideDetails.getAge());
        guide.setNationalite(guideDetails.getNationalite());
        guide.setCin(guideDetails.getCin());
        guide.setVille(guideDetails.getVille());
        guide.setRegion(guideDetails.getRegion());
        guide.setLangues(guideDetails.getLangues());
        guide.setExperience(guideDetails.getExperience());
        guide.setDescription(guideDetails.getDescription());
        guide.setTarifHoraire(guideDetails.getTarifHoraire());
        guide.setTarifDemiJournee(guideDetails.getTarifDemiJournee());
        guide.setTarifJournee(guideDetails.getTarifJournee());
        guide.setTelephone(guideDetails.getTelephone());
        guide.setEmail(guideDetails.getEmail());
        guide.setAdresse(guideDetails.getAdresse());
        guide.setActif(guideDetails.getActif());

        Guide updatedGuide = guideRepository.save(guide);
        log.info("✅ Guide mis à jour: ID = {}", updatedGuide.getId());

        return updatedGuide;
    }

    @Transactional
    public void deleteGuide(Long id) {
        log.info("🗑️ Suppression guide ID: {}", id);
        Guide guide = getGuideById(id);

        // Supprimer l'image associée
        if (guide.getPhotoFileName() != null) {
            try {
                fileStorageService.deleteFile(guide.getPhotoFileName());
            } catch (Exception e) {
                log.warn("⚠️ Impossible de supprimer l'image: {}", e.getMessage());
            }
        }

        guideRepository.delete(guide);
        log.info("✅ Guide supprimé: ID = {}", id);
    }

    public Guide getGuideById(Long id) {
        return guideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guide non trouvé avec l'ID: " + id));
    }

    public List<Guide> getAllGuides() {
        return guideRepository.findAll();
    }

    public List<Guide> getActiveGuides() {
        return guideRepository.findByActifTrue();
    }

    public List<Guide> getGuidesByVille(String ville) {
        return guideRepository.findByVilleIgnoreCase(ville);
    }

    public List<Guide> getGuidesByRegion(String region) {
        return guideRepository.findByRegionIgnoreCase(region);
    }

    @Transactional
    public Guide toggleGuideStatus(Long id) {
        Guide guide = getGuideById(id);
        guide.setActif(!guide.getActif());
        return guideRepository.save(guide);
    }
}