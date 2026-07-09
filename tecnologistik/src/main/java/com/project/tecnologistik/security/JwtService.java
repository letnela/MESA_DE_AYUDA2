package com.project.tecnologistik.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import io.jsonwebtoken.security.Keys;

import org.springframework.stereotype.Service;

import java.security.Key;

import java.util.Date;

@Service
public class JwtService {

    private static final String SECRET =
            "tecnologistik_super_secret_key_2026_muy_segura_123456";

    private final Key key =
            Keys.hmacShaKeyFor(SECRET.getBytes());

    private final long EXPIRATION =
            1000 * 60 * 60;

    public String generateToken(String email, String rol) {

        return Jwts.builder()
                .setSubject(email)
                .claim("rol", rol)
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(
                                System.currentTimeMillis() + EXPIRATION
                        )
                )
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims extractClaims(String token) {

        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    public String extractRol(String token) {
        return extractClaims(token)
                .get("rol", String.class);
    }

    public boolean isTokenValid(String token) {

        Date expiration =
                extractClaims(token).getExpiration();

        return expiration.after(new Date());
    }
}