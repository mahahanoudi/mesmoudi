package com.example.auth_service.controller;

import com.example.auth_service.dto.SyncUserRequest;
import com.example.auth_service.dto.UserDTO;
import com.example.auth_service.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = { "http://localhost:3000", "http://127.0.0.1:3000" })
public class AuthController {

    private final UserService userService;

    /**
     * Synchronise un utilisateur Clerk avec la base de données locale
     * Endpoint public - appelé après chaque connexion Clerk
     */
    @PostMapping("/sync")
    public ResponseEntity<UserDTO> syncUser(@RequestBody SyncUserRequest request) {
        log.info("POST /api/auth/sync - Syncing user: {}", request.getEmail());
        try {
            UserDTO user = userService.syncUser(request);
            log.info("User synced successfully: {}", user.getEmail());
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("Error syncing user: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Récupère le profil de l'utilisateur connecté via son token JWT Clerk
     * Endpoint protégé - nécessite un token JWT valide
     */
    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            log.warn("GET /api/auth/profile - No JWT token provided");
            return ResponseEntity.status(401).build();
        }

        // Le subject du JWT Clerk contient le clerkId
        String clerkId = jwt.getSubject();
        log.info("GET /api/auth/profile - Getting profile for clerkId: {}", clerkId);

        try {
            UserDTO user = userService.getUserByClerkId(clerkId);
            log.info("Profile retrieved for: {}", user.getEmail());
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            log.error("User not found for clerkId: {}", clerkId);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Endpoint de test pour vérifier que le service fonctionne
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Auth service is running!");
    }
}
