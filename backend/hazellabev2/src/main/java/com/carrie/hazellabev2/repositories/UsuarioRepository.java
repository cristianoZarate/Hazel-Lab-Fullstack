package com.carrie.hazellabev2.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import com.carrie.hazellabev2.entities.Usuario;

public interface UsuarioRepository extends CrudRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    
    // ✅ NUEVO: Buscar por RUT para evitar duplicados
    Optional<Usuario> findByRut(String rut);

    // ✅ NUEVOS MÉTODOS DE FILTRADO
    List<Usuario> findByUsernameContainingIgnoreCase(String username);
    List<Usuario> findByRole(String role);
    List<Usuario> findByStatus(String status);
    
    // ✅ Método combinado para búsqueda más flexible
    List<Usuario> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(String username, String email);
    
}