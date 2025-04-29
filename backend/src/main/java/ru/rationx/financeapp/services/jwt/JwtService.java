package ru.rationx.financeapp.services.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Slf4j
@Service
public class JwtService {

    @Value("${spring.jwt.secret}")
    private String secret;

    // 24 часа в миллисекундах
    private final long EXPIRATION = 1000 * 60 * 60 * 24;

    private Key getSignKey() {
        // Убедимся, что ключ соответствует минимальным требованиям для HS256 (256 бит / 32 байта)
        byte[] keyBytes;
        
        // Если секрет закодирован в Base64, декодируем его
        if (secret.endsWith("==") && (secret.length() % 4 == 0)) {
            try {
                keyBytes = Base64.getDecoder().decode(secret);
                log.debug("Using Base64 decoded key, length: {} bytes", keyBytes.length);
            } catch (IllegalArgumentException e) {
                // Если не удалось декодировать как Base64, используем как обычную строку
                keyBytes = secret.getBytes(StandardCharsets.UTF_8);
                log.debug("Using raw string key, length: {} bytes", keyBytes.length);
            }
        } else {
            // Используем обычную строку
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
            log.debug("Using raw string key, length: {} bytes", keyBytes.length);
        }
        
        // Если ключ слишком короткий, выведем предупреждение
        if (keyBytes.length < 32) {
            log.warn("JWT secret key is less than 256 bits, this is insecure! Length: {} bytes", keyBytes.length);
        }
        
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Генерирует JWT токен для пользователя
     */
    public String generateToken(UserDetails userDetails) {
        log.debug("Generating token for user: {}", userDetails.getUsername());
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }

    /**
     * Создает JWT токен
     */
    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + EXPIRATION);
        log.debug("Creating token for subject: {}, expires at: {}", subject, expiryDate);
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Извлекает имя пользователя из токена
     */
    public String extractUsername(String token) {
        try {
            String username = extractClaim(token, Claims::getSubject);
            log.debug("Extracted username from token: {}", username);
            return username;
        } catch (JwtException e) {
            log.error("Failed to extract username from token: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Извлекает конкретный claim из токена
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Извлекает все claims из токена
     */
    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSignKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException e) {
            log.error("Error parsing JWT claims: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Проверяет валидность токена
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            boolean isValid = username.equals(userDetails.getUsername()) && !isTokenExpired(token);
            log.debug("Token validation for user {}: {}", userDetails.getUsername(), isValid);
            return isValid;
        } catch (JwtException e) {
            log.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Проверяет, истек ли срок действия токена
     */
    private boolean isTokenExpired(String token) {
        final Date expiration = extractExpiration(token);
        boolean isExpired = expiration.before(new Date());
        if (isExpired) {
            log.debug("Token expired at: {}", expiration);
        }
        return isExpired;
    }

    /**
     * Извлекает дату истечения срока действия из токена
     */
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}
