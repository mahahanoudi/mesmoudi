package com.example.auth_service.controller;


import com.example.auth_service.dto.SyncUserRequest;
import com.example.auth_service.entity.User;
import com.example.auth_service.service.AuthService;
import com.example.auth_service.service.ClerkJwtService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final ClerkJwtService clerkJwtService;

    @PostMapping("/sync")
    public ResponseEntity<?> syncUser(@RequestBody SyncUserRequest request) {
        try {
            log.info("📥 Requête de synchronisation pour: {}", request.getEmail());
            User user = authService.syncUser(request);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Utilisateur synchronisé avec succès");
            response.put("user", Map.of(
                    "id", user.getId(),
                    "clerkId", user.getClerkId(),
                    "email", user.getEmail(),
                    "firstName", user.getFirstName(),
                    "lastName", user.getLastName(),
                    "role", user.getRole().toString(),
                    "imageUrl", user.getImageUrl()
            ));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Erreur synchronisation: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Claims claims = clerkJwtService.validateToken(token);
            String clerkId = clerkJwtService.extractClerkId(claims);

            User user = authService.getUserByClerkId(clerkId);

            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("clerkId", user.getClerkId());
            response.put("email", user.getEmail());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("role", user.getRole().toString());
            response.put("imageUrl", user.getImageUrl());
            response.put("active", user.getActive());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Erreur récupération profil: {}", e.getMessage());
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Non autorisé"));
        }
    }


}