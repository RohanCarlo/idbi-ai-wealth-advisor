package com.idbi.wealthadvisor.service;

import com.idbi.wealthadvisor.dto.*;
import com.idbi.wealthadvisor.entity.Role;
import com.idbi.wealthadvisor.entity.User;
import com.idbi.wealthadvisor.exception.UnauthorizedException;
import com.idbi.wealthadvisor.repository.UserRepository;
import com.idbi.wealthadvisor.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = userRepository.save(User.builder()
                .email(request.email())
                .name(request.name())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .build());

        return AuthResponse.of(
                jwtService.generateToken(user),
                jwtService.generateRefreshToken(user),
                toDto(user)
        );
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return AuthResponse.of(
                jwtService.generateToken(user),
                jwtService.generateRefreshToken(user),
                toDto(user)
        );
    }

    public AuthResponse refresh(RefreshTokenRequest request) {
        String username = jwtService.extractUsername(request.refreshToken());
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!jwtService.isTokenValid(request.refreshToken(), user)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        return AuthResponse.of(
                jwtService.generateToken(user),
                request.refreshToken(),
                toDto(user)
        );
    }

    public UserDto toDto(User user) {
        return new UserDto(user.getId(), user.getEmail(), user.getName(), user.getRole().name());
    }
}
