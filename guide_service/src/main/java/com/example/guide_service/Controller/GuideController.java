package com.example.guide_service.Controller;

import com.example.guide_service.models.Guide;
import com.example.guide_service.service.GuideService;
import com.example.guide_service.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/guides")
@RequiredArgsConstructor
@Slf4j
public class GuideController {

    private final GuideService guideService;
    private final FileStorageService fileStorageService;

    // ✅ Créer un nouveau guide AVEC image

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createGuide(
            @RequestParam("nom") String nom,
            @RequestParam("prenom") String prenom,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestParam("age") Integer age,
            @RequestParam("nationalite") String nationalite,
            @RequestParam("cin") String cin,
            @RequestParam("ville") String ville,
            @RequestParam("region") String region,
            @RequestParam("langues") String langues,
            @RequestParam("experience") Integer experience,
            @RequestParam("description") String description,
            @RequestParam("tarifHoraire") Double tarifHoraire,
            @RequestParam("tarifDemiJournee") Double tarifDemiJournee,
            @RequestParam("tarifJournee") Double tarifJournee,
            @RequestParam("telephone") String telephone,
            @RequestParam("email") String email,
            @RequestParam("adresse") String adresse,
            @RequestParam("actif") Boolean actif) {

        try {
            log.info("📥 Création guide avec multipart: {} {}", prenom, nom);

            // Créer l'objet Guide
            Guide guide = new Guide();
            guide.setNom(nom);
            guide.setPrenom(prenom);
            guide.setAge(age);
            guide.setNationalite(nationalite);
            guide.setCin(cin);
            guide.setVille(ville);
            guide.setRegion(region);
            guide.setLangues(langues);
            guide.setExperience(experience);
            guide.setDescription(description);
            guide.setTarifHoraire(tarifHoraire);
            guide.setTarifDemiJournee(tarifDemiJournee);
            guide.setTarifJournee(tarifJournee);
            guide.setTelephone(telephone);
            guide.setEmail(email);
            guide.setAdresse(adresse);
            guide.setActif(actif);

            // ✅ SAUVEGARDER D'ABORD LE GUIDE (pour avoir un ID)
            Guide savedGuide = guideService.createGuide(guide);

            // ✅ SI UNE IMAGE EST FOURNIE, L'ENREGISTRER DANS LE DOSSIER
            if (photo != null && !photo.isEmpty()) {
                try {
                    String guideName = prenom + "_" + nom;
                    String fileName = fileStorageService.storeFile(photo, guideName, savedGuide.getId());

                    // Mettre à jour le guide avec le nom du fichier
                    savedGuide.setPhotoFileName(fileName);
                    savedGuide = guideService.updateGuide(savedGuide.getId(), savedGuide);

                    log.info("✅ Image enregistrée: {}", fileName);
                } catch (Exception e) {
                    log.warn("⚠️ Erreur sauvegarde image: {}", e.getMessage());
                    // Continuer sans photo
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Guide créé avec succès");
            response.put("guide", savedGuide);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("❌ Erreur création guide: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    // 📋 Récupérer tous les guides
    @GetMapping
    public ResponseEntity<?> getAllGuides() {
        try {
            List<Guide> guides = guideService.getAllGuides();

            // Ajouter l'URL complète de l'image
            guides.forEach(guide -> {
                if (guide.getPhotoFileName() != null) {
                    guide.setPhotoFileName("/api/guides/images/" + guide.getPhotoFileName());
                }
            });

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", guides.size());
            response.put("guides", guides);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Erreur récupération guides: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // 🖼️ Endpoint pour servir les images
    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<?> getImage(@PathVariable String filename) {
        try {
            Path filePath = fileStorageService.loadFile(filename);
            byte[] imageBytes = Files.readAllBytes(filePath);

            String mimeType = Files.probeContentType(filePath);
            if (mimeType == null) {
                mimeType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.valueOf(mimeType))
                    .body(imageBytes);

        } catch (Exception e) {
            log.error("❌ Erreur chargement image: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ... (autres méthodes GET, PUT, DELETE restent similaires)
}