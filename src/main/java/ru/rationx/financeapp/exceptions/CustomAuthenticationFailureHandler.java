package ru.rationx.financeapp.exceptions;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;

import java.io.IOException;

public class CustomAuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        String errorMessage = "Неверные учетные данные";

        if (exception instanceof BadCredentialsException) {
            errorMessage = "Данные для авторизации некорректны, попробуйте еще раз.";
        }

        request.getSession().setAttribute("SPRING_SECURITY_LAST_EXCEPTION", errorMessage);
        getRedirectStrategy().sendRedirect(request, response, "/login?error");
    }
}

