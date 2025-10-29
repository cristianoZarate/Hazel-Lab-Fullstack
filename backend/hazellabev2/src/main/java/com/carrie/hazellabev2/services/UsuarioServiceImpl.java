// ===== SERVICES COMPLETOS =====

package com.carrie.hazellabev2.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.carrie.hazellabev2.entities.Usuario;
import com.carrie.hazellabev2.repositories.UsuarioRepository;

@Service
public class UsuarioServiceImpl implements UsuarioService {
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public Usuario crear(Usuario usuario) {
        if (usuario.getPassword() == null || usuario.getPassword().isEmpty()) {
            throw new RuntimeException("La contraseña no puede ser nula o vacía");
        }

        if (usuario.getRut() == null || usuario.getRut().isEmpty()) {
            throw new RuntimeException("El RUT es obligatorio");
        }

        // ✅ VALIDACIÓN DE EMAIL MEJORADA
        if (!validarEmail(usuario.getEmail())) {
            throw new RuntimeException("El correo debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com");
        }

        usuario.setRole(usuario.getRole() != null ? usuario.getRole() : "cliente");
        usuario.setStatus(usuario.getStatus() != null ? usuario.getStatus() : "activo");
        usuario.setCreatedAt(usuario.getCreatedAt() != null ? usuario.getCreatedAt() : LocalDateTime.now());

        // ✅ VALORES POR DEFECTO PARA NUEVOS CAMPOS
        if (usuario.getApellidos() == null) {
            usuario.setApellidos("");
        }
        if (usuario.getDireccion() == null) {
            usuario.setDireccion("");
        }

        String passwordEncriptada = passwordEncoder.encode(usuario.getPassword());
        usuario.setPassword(passwordEncriptada);
        return usuarioRepository.save(usuario);
    }

    @Override
    public Usuario obtenerPorID(Long id) {
        return usuarioRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));
    };  

    @Override
    public Usuario actualizar(Long id, Usuario usuarioActualizado) {
        Usuario usuarioExistente = obtenerPorID(id);
        
        // ✅ ACTUALIZAR TODOS LOS CAMPOS EDITABLES (INCLUYENDO NUEVOS)
        usuarioExistente.setUsername(usuarioActualizado.getUsername());
        usuarioExistente.setApellidos(usuarioActualizado.getApellidos());
        usuarioExistente.setEmail(usuarioActualizado.getEmail());
        usuarioExistente.setRut(usuarioActualizado.getRut());
        usuarioExistente.setRole(usuarioActualizado.getRole());
        usuarioExistente.setStatus(usuarioActualizado.getStatus());
        usuarioExistente.setFechaNacimiento(usuarioActualizado.getFechaNacimiento());
        usuarioExistente.setRegion(usuarioActualizado.getRegion());
        usuarioExistente.setComuna(usuarioActualizado.getComuna());
        usuarioExistente.setDireccion(usuarioActualizado.getDireccion());
        
        // ✅ VALIDACIÓN DE EMAIL EN ACTUALIZACIÓN
        if (usuarioActualizado.getEmail() != null && !validarEmail(usuarioActualizado.getEmail())) {
            throw new RuntimeException("El correo debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com");
        }
        
        // ✅ SOLO ACTUALIZAR PASSWORD SI SE PROPORCIONA UNA NUEVA
        if (usuarioActualizado.getPassword() != null && 
            !usuarioActualizado.getPassword().isEmpty() &&
            !passwordEncoder.matches(usuarioActualizado.getPassword(), usuarioExistente.getPassword())) {
            
            String passwordEncriptada = passwordEncoder.encode(usuarioActualizado.getPassword());
            usuarioExistente.setPassword(passwordEncriptada);
        }
        
        return usuarioRepository.save(usuarioExistente);
    };

    @Override
    public List<Usuario> listarTodo() {
        return (List<Usuario>) usuarioRepository.findAll();
    }; 

    @Override
    public void eliminar(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RuntimeException("Usuario no encontrado.");
        } 
        usuarioRepository.deleteById(id);
    };

    @Override
    public boolean validarPassword(String passwordPlano, String passwordEncriptado) {
        return passwordEncoder.matches(passwordPlano, passwordEncriptado);
    }

    // Del repository
    @Override
    public Usuario findByEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @Override
    public Usuario login(String email, String password) {
        // Buscar usuario por email
        Usuario usuario = findByEmail(email);

        // Verificar contraseña ENCRIPTADA 
        if (!validarPassword(password, usuario.getPassword())) {
            throw new RuntimeException("Credenciales inválidas.");
        }

        // Verificar que el usuario esté activo
        if (!usuario.getStatus().equals("activo")) {
            throw new RuntimeException("Usuario inactivo.");
        }

        return usuario;
    }

    // ✅ NUEVO MÉTODO PARA VALIDAR EMAIL
    private boolean validarEmail(String email) {
        if (email == null) return false;
        return email.endsWith("@duoc.cl") || 
               email.endsWith("@profesor.duoc.cl") || 
               email.endsWith("@gmail.com");
    }

    // ✅ NUEVOS MÉTODOS DE BÚSQUEDA
    @Override
    public List<Usuario> buscarPorUsername(String username) {
        return usuarioRepository.findByUsernameContainingIgnoreCase(username);
    }

    @Override
    public List<Usuario> buscarPorRol(String role) {
        return usuarioRepository.findByRole(role);
    }

    @Override
    public List<Usuario> buscarPorEstado(String status) {
        return usuarioRepository.findByStatus(status);
    }
}