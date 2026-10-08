package br.cefetmg.nuclleo.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        @Autowired
        private JwtAuthenticationFilter jwtAuthenticationFilter;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

                http
                                .csrf(csrf -> csrf.disable())
                                .cors(cors -> Customizer.withDefaults())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                .authorizeHttpRequests(auth -> auth

                                                // Swagger e erros
                                                .requestMatchers(
                                                                "/swagger-ui/**",
                                                                "/swagger-ui.html",
                                                                "/v3/api-docs/**",
                                                                "/error")
                                                .permitAll()

                                                // Preflight CORS
                                                .requestMatchers(HttpMethod.OPTIONS, "/**")
                                                .permitAll()

                                                // Endpoints públicos
                                                .requestMatchers(HttpMethod.POST, "/api/v1/autenticar")
                                                .permitAll()

                                                .requestMatchers(HttpMethod.POST, "/api/v1/usuarios")
                                                .permitAll()

                                                .requestMatchers(HttpMethod.POST, "/api/v1/usuarios/verificar-email")
                                                .permitAll()

                                                // WebSocket
                                                .requestMatchers("/ws-chat/**")
                                                .permitAll()

                                                // Endpoints exclusivos do ADMINISTRADOR
                                                .requestMatchers("/api/v1/admin/**")
                                                .hasAuthority("ADMINISTRADOR")

                                                // Tudo mais exige autenticação (USUARIO ou ADMINISTRADOR)
                                                .anyRequest().authenticated())

                                .exceptionHandling(exception -> exception
                                                .authenticationEntryPoint(
                                                                (request, response, authException) -> response
                                                                                .setStatus(HttpServletResponse.SC_UNAUTHORIZED))
                                                .accessDeniedHandler(
                                                                (request, response, accessDeniedException) -> response
                                                                                .setStatus(HttpServletResponse.SC_FORBIDDEN)))

                                .httpBasic(httpBasic -> httpBasic.disable())
                                .formLogin(formLogin -> formLogin.disable())

                                .addFilterBefore(
                                                jwtAuthenticationFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public AuthenticationManager authenticationManager(
                        AuthenticationConfiguration authenticationConfiguration)
                        throws Exception {
                return authenticationConfiguration.getAuthenticationManager();
        }
}