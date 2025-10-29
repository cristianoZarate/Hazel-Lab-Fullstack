package com.carrie.hazellabev2.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.carrie.hazellabev2.entities.Categoria;
import com.carrie.hazellabev2.repositories.CategoriaRepository;

@Service

public class CategoriaServiceImpl implements CategoriaService {
    @Autowired
    private CategoriaRepository categoriaRepository;

    @Override
    public Categoria crear(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    @Override
    public Categoria obtenerPorID(Long id) {
        return categoriaRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Categoría no encontrada."));
    };  

    @Override
    public Categoria actualizar(Long id, Categoria categoriaActualizada) {
        Categoria categoriaExistente = obtenerPorID(id);
        categoriaExistente.setNombre(categoriaActualizada.getNombre());
        return categoriaRepository.save(categoriaExistente);
    };

    @Override
    public List<Categoria> listarTodo() {
        return (List<Categoria>) categoriaRepository.findAll();
    };

    @Override
    public void eliminar(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new RuntimeException("Categoría no encontrada.");
        } categoriaRepository.deleteById(id);
    };
}
