package com.carrie.hazellabev2.services;

import java.util.List;

import com.carrie.hazellabev2.entities.Usuario;

public interface UsuarioService {
    /* ---------------------------------- CRUD simple ---------------------------------- */
    Usuario crear(Usuario usuario);
    Usuario obtenerPorID(Long id);    
    Usuario actualizar(Long id, Usuario usuarioActualizado);
    List<Usuario> listarTodo();
    void eliminar(Long id);
    /* ---------------------------------- Autenticación ---------------------------------- */
    boolean validarPassword(String passwordPlano, String passwordEncriptado);
    Usuario findByEmail(String email);
    Usuario login(String email, String password);
    /* ---------------------------------- Filtrado ---------------------------------- */
    List<Usuario> buscarPorUsername(String username);
    List<Usuario> buscarPorRol(String role);
    List<Usuario> buscarPorEstado(String status);
}