package com.ssunen.backend.security;

import com.ssunen.backend.exception.ForbiddenException;
import com.ssunen.backend.exception.UnauthorizedException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.mindrot.jbcrypt.BCrypt;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Date;
import java.util.Map;

public class AuthService {
    private final SecretKey secretKey;

    public AuthService() {
        String secret = env("JWT_SECRET", "micontraseña-migrada-a-java-con-longitud-suficiente");
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String hashPassword(String password) {
        return BCrypt.hashpw(password, BCrypt.gensalt(10));
    }

    public boolean passwordMatches(String plainPassword, String storedPassword) {
        if (storedPassword == null || plainPassword == null) {
            return false;
        }
        if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
            return BCrypt.checkpw(plainPassword, storedPassword);
        }
        return plainPassword.equals(storedPassword);
    }

    public String issueToken(Map<String, Object> user) {
        Date now = new Date();
        Date expires = new Date(now.getTime() + 24L * 60L * 60L * 1000L);
        return Jwts.builder()
            .claim("id", ((Number) user.get("id")).intValue())
            .claim("username", String.valueOf(user.get("username")))
            .claim("role", role(user))
            .setIssuedAt(now)
            .setExpiration(expires)
            .signWith(secretKey, SignatureAlgorithm.HS256)
            .compact();
    }

    public AuthUser verify(String token) throws UnauthorizedException {
        if (token == null || token.isBlank()) {
            throw new UnauthorizedException("Token no proporcionado");
        }
        try {
            Claims claims = Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token).getBody();
            return new AuthUser(
                ((Number) claims.get("id")).intValue(),
                String.valueOf(claims.get("username")),
                String.valueOf(claims.get("role"))
            );
        } catch (JwtException | IllegalArgumentException ex) {
            throw new UnauthorizedException("Token inválido o expirado");
        }
    }

    public void requireRole(AuthUser user, String... roles) throws ForbiddenException {
        if (Arrays.stream(roles).noneMatch(role -> role.equals(user.role()))) {
            throw new ForbiddenException("No tienes permisos para acceder a este recurso");
        }
    }

    public String role(Map<String, Object> user) {
        Object role = user.get("role");
        return role == null ? "customer" : String.valueOf(role);
    }

    private static String env(String key, String fallback) {
        String value = System.getenv(key);
        if (value == null || value.isBlank()) {
            value = System.getProperty(key);
        }
        return value == null || value.isBlank() ? fallback : value;
    }

    public record AuthUser(int id, String username, String role) {}
}
