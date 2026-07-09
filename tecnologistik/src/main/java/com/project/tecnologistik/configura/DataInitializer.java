package com.project.tecnologistik.configura;

import com.project.tecnologistik.model.Rol;
import com.project.tecnologistik.model.Usuario;
import com.project.tecnologistik.repository.RolRepository;
import com.project.tecnologistik.repository.UsuarioRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(
            RolRepository rolRepository,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {

            Rol adminRol = rolRepository.findByNombre("ADMIN")
                    .orElseGet(() -> rolRepository.save(new Rol("ADMIN")));

            rolRepository.findByNombre("TECNICO")
                    .orElseGet(() -> rolRepository.save(new Rol("TECNICO")));

            rolRepository.findByNombre("USUARIO")
                    .orElseGet(() -> rolRepository.save(new Rol("USUARIO")));

            if (!usuarioRepository.existsByEmail("admin@gmail.com")) {

                Usuario admin = new Usuario();

                admin.setNombreCompleto("Administrador");
                admin.setEmail("admin@gmail.com");
                admin.setPasswordHash(passwordEncoder.encode("admin123"));
                admin.setRol(adminRol);
                admin.setEstado(true);

                usuarioRepository.save(admin);
            }
        };
    }
}