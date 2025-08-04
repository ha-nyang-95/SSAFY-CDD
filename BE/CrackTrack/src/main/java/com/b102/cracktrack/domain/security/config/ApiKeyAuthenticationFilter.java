package com.b102.cracktrack.domain.security.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;


@Slf4j
@Component
@Order(0)
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {

  @Value("${x.api.key}")
  private String apiKey;


  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {
    String uri = request.getRequestURI();
    if(uri.startsWith("/api/lambda")||uri.startsWith("/api/mqtt/")) {
      String reqKey = request.getHeader("X-API-KEY");
      if(reqKey==null || !reqKey.equals(apiKey)) {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write("Invalid API Key");
        return;
      }
    }
    filterChain.doFilter(request, response);
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    String uri = request.getRequestURI();
    return !(uri.startsWith("/api/lambda") || uri.startsWith("/api/mqtt/"));
  }
}
