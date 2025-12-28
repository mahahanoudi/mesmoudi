package com.example.auth_service.config;


import com.example.auth_service.service.ClerkJwtService;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
public class ClerkAuthenticationFilter extends OncePerRequestFilter {

    private final ClerkJwtService clerkJwtService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        try {
            String authHeader = request.getHeader("Authorization");

            // Si pas de header ou ne commence pas par "Bearer "
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }

            // Extraire le token
            String token = authHeader.substring(7);

            // Valider le token avec Clerk
            Claims claims = clerkJwtService.validateToken(token);
            String clerkId = clerkJwtService.extractClerkId(claims);
            String email = clerkJwtService.extractEmail(claims);

            // Créer l'authentification
            if (clerkId != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // Autorités par défaut (peut être enrichi avec les rôles Clerk)
                List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_USER")
                );

                // Créer le token d'authentification Spring Security
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                clerkId,
                                null,
                                authorities
                        );

                // Ajouter les détails de la requête
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // Définir l'authentification dans le contexte Spring Security
                SecurityContextHolder.getContext().setAuthentication(authToken);

                log.debug("✅ Utilisateur authentifié: {} ({})", email, clerkId);
            }

        } catch (Exception e) {
            log.error("❌ Erreur d'authentification: {}", e.getMessage());
            // Ne pas bloquer la requête, laisser Spring Security gérer
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        String path = request.getRequestURI();
        return path.equals("/api/auth/sync");
    }
}