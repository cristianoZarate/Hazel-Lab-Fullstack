package com.carrie.hazellabev2.services;

import java.util.List;

import com.carrie.hazellabev2.entities.Categoria;

public interface CategoriaService {
    Categoria crear(Categoria categoria);
    Categoria obtenerPorID(Long id);    
    Categoria actualizar(Long id, Categoria categoriaActualizada);
    List<Categoria> listarTodo();
    void eliminar(Long id);
}
