package com.example.auth_service.service;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.extern.slf4j.Slf4j;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class ClerkJwtService {

    @Value("${clerk.jwks.url}")
    private String jwksUrl;

    private final OkHttpClient httpClient = new OkHttpClient();
    private final Map<String, PublicKey> publicKeyCache = new HashMap<>();

    public Claims validateToken(String token) {
        try {
            // Extraire le kid (Key ID) du header JWT
            String[] parts = token.split("\\.");
            String header = new String(Base64.getUrlDecoder().decode(parts[0]));
            JSONObject headerJson = new JSONObject(header);
            String kid = headerJson.getString("kid");

            // Récupérer la clé publique
            PublicKey publicKey = getPublicKey(kid);

            // Valider et parser le token
            return Jwts.parserBuilder()
                    .setSigningKey(publicKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

        } catch (Exception e) {
            log.error("❌ Erreur validation token: {}", e.getMessage());
            throw new RuntimeException("Token invalide", e);
        }
    }

    private PublicKey getPublicKey(String kid) throws Exception {
        // Vérifier le cache
        if (publicKeyCache.containsKey(kid)) {
            return publicKeyCache.get(kid);
        }

        // Récupérer les clés JWKS depuis Clerk
        Request request = new Request.Builder()
                .url(jwksUrl)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new RuntimeException("Erreur récupération JWKS");
            }

            String body = response.body().string();
            JSONObject jwks = new JSONObject(body);
            JSONArray keys = jwks.getJSONArray("keys");

            // Trouver la clé correspondante
            for (int i = 0; i < keys.length(); i++) {
                JSONObject key = keys.getJSONObject(i);
                if (kid.equals(key.getString("kid"))) {
                    PublicKey publicKey = buildPublicKey(
                            key.getString("n"),
                            key.getString("e")
                    );
                    publicKeyCache.put(kid, publicKey);
                    return publicKey;
                }
            }

            throw new RuntimeException("Clé publique non trouvée pour kid: " + kid);
        }
    }

    private PublicKey buildPublicKey(String modulusBase64, String exponentBase64) throws Exception {
        byte[] modulusBytes = Base64.getUrlDecoder().decode(modulusBase64);
        byte[] exponentBytes = Base64.getUrlDecoder().decode(exponentBase64);

        BigInteger modulus = new BigInteger(1, modulusBytes);
        BigInteger exponent = new BigInteger(1, exponentBytes);

        RSAPublicKeySpec spec = new RSAPublicKeySpec(modulus, exponent);
        KeyFactory factory = KeyFactory.getInstance("RSA");
        return factory.generatePublic(spec);
    }

    public String extractClerkId(Claims claims) {
        return claims.getSubject();
    }

    public String extractEmail(Claims claims) {
        return claims.get("email", String.class);
    }
}