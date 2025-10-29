package com.carrie.hazellabev2.services;

import java.util.List;

import com.carrie.hazellabev2.entities.Blog;

public interface BlogService {
    Blog crear(Blog blog);
    Blog obtenerPorID(Long id);    
    Blog actualizar(Long id, Blog blogActualizado);
    List<Blog> listarTodo();
    void eliminar(Long id);
}
