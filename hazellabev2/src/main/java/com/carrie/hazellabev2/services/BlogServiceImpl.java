package com.carrie.hazellabev2.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.carrie.hazellabev2.entities.Blog;
import com.carrie.hazellabev2.repositories.BlogRepository;

@Service

public class BlogServiceImpl implements BlogService {
    @Autowired
    private BlogRepository blogRepository;

    @Override
    public Blog crear(Blog blog) {
        return blogRepository.save(blog);
    }

    @Override
    public Blog obtenerPorID(Long id) {
        return blogRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Blog no encontrado."));
    }

    @Override
    public Blog actualizar(Long id, Blog blogActualizado) {
        Blog blogExistente = obtenerPorID(id);
        blogExistente.setTitle(blogActualizado.getTitle());
        blogExistente.setBody(blogActualizado.getBody());
        return blogRepository.save(blogExistente);
    }

    @Override
    public List<Blog> listarTodo() {
        return (List<Blog>) blogRepository.findAll();
    }

    @Override
    public void eliminar(Long id) {
        if (!blogRepository.existsById(id)) {
            throw new RuntimeException("Blog no encontrado");
        } blogRepository.deleteById(id);
    }
}
