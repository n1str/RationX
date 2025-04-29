package ru.rationx.financeapp.configuration;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import ru.rationx.financeapp.services.AuthUserService;
import ru.rationx.financeapp.services.jwt.JwtService;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final AuthUserService userService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain chain) throws ServletException, IOException {

        final String requestURI = request.getRequestURI();
        log.debug("Processing request: {}", requestURI);

        // Пропускаем запросы для регистрации и аутентификации
        if (requestURI.startsWith("/api/auth/")) {
            log.debug("Authentication endpoint, skipping JWT validation");
            chain.doFilter(request, response);
            return;
        }

        // Получаем заголовок авторизации
        final String authHeader = request.getHeader("Authorization");
        log.debug("Authorization header: {}", authHeader);

        // Если нет заголовка или он не начинается с "Bearer ", пропускаем запрос
        // (Spring Security отклонит его, если путь не в списке permitAll)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Missing or invalid Authorization header for path: {}", requestURI);
            chain.doFilter(request, response);
            return;
        }

        try {
            // Извлекаем токен из заголовка
            final String jwt = authHeader.substring(7);
            
            // Извлекаем имя пользователя из токена
            final String username = jwtService.extractUsername(jwt);
            log.debug("Extracted username from token: {}", username);
            
            // Если имя пользователя не null и нет текущей аутентификации
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Загружаем данные пользователя
                UserDetails userDetails = userService.loadUserByUsername(username);
                
                // Проверяем валидность токена
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    log.debug("Token is valid for user: {}", username);
                    
                    // Создаем объект аутентификации
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    
                    // Добавляем детали запроса
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // Устанавливаем аутентификацию в контекст безопасности
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("Authentication set in SecurityContext for user: {}", username);
                } else {
                    log.warn("Invalid token for user: {}", username);
                }
            }
        } catch (ExpiredJwtException e) {
            log.warn("JWT token expired: {}", e.getMessage());
        } catch (SignatureException e) {
            log.warn("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("Malformed JWT token: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("Unsupported JWT token: {}", e.getMessage());
        } catch (UsernameNotFoundException e) {
            log.warn("User not found: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Error processing JWT token: {}", e.getMessage(), e);
        }

        // Всегда продолжаем цепочку фильтров
        // Spring Security сам отклонит запрос, если аутентификация не была установлена
        chain.doFilter(request, response);
    }
}
