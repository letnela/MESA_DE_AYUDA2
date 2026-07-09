package com.project.tecnologistik.service;

import com.project.tecnologistik.dto.AuthResponse;
import com.project.tecnologistik.dto.LoginRequest;
import com.project.tecnologistik.dto.RegisterRequest;
import com.project.tecnologistik.model.Rol;
import com.project.tecnologistik.model.Usuario;
import com.project.tecnologistik.repository.RolRepository;
import com.project.tecnologistik.repository.UsuarioRepository;
import com.project.tecnologistik.security.JwtService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {

        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya existe");
        }

        Rol rol = rolRepository
                .findByNombre(request.getRol())
                .orElseGet(() -> {
                    Rol nuevoRol = new Rol();
                    nuevoRol.setNombre(request.getRol());
                    return rolRepository.save(nuevoRol);
                });

        Usuario usuario = new Usuario();

        usuario.setNombreCompleto(request.getNombreCompleto());
        usuario.setEmail(request.getEmail());
        usuario.setPasswordHash(
                passwordEncoder.encode(request.getPassword())
        );
        usuario.setRol(rol);
        usuario.setEstado(true);

        usuarioRepository.save(usuario);

        String token = jwtService.generateToken(
                usuario.getEmail(),
                usuario.getRol().getNombre()
        );

        return new AuthResponse(
                token,
                "Bearer",
                usuario.getRol().getNombre(),
                usuario.getId(),
                usuario.getEmail(),
                usuario.getNombreCompleto()
        );
    }

    public AuthResponse login(LoginRequest request) {

        Usuario usuario = usuarioRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        boolean passwordCorrecto = passwordEncoder.matches(
                request.getPassword(),
                usuario.getPasswordHash()
        );

        if (!passwordCorrecto) {
            throw new RuntimeException("Password incorrecto");
        }

        String token = jwtService.generateToken(
                usuario.getEmail(),
                usuario.getRol().getNombre()
        );

        return new AuthResponse(
                token,
                "Bearer",
                usuario.getRol().getNombre(),
                usuario.getId(),
                usuario.getEmail(),
                usuario.getNombreCompleto()
        );
    }
}