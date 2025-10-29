package com.carrie.hazellabev2.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.carrie.hazellabev2.entities.Producto;
import com.carrie.hazellabev2.repositories.ProductoRepository;

@Service
public class ProductoServiceImpl implements ProductoService {
    
    @Autowired
    private ProductoRepository productoRepository;

    /* ---------------------------------- CRUD simple ---------------------------------- */
    @Override
    public Producto crear(Producto producto) {
        return productoRepository.save(producto);
    }

    @Override
    public Producto obtenerPorID(Long id) {
        return productoRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Producto no encontrado."));
    }    

    @Override
    public Producto actualizar(Long id, Producto productoActualizado) {
        Producto productoExistente = obtenerPorID(id);

        productoExistente.setName(productoActualizado.getName());
        productoExistente.setBatchCode(productoActualizado.getBatchCode());
        productoExistente.setDescription(productoActualizado.getDescription());
        productoExistente.setChemCode(productoActualizado.getChemCode());
        productoExistente.setExpDate(productoActualizado.getExpDate());
        productoExistente.setElabDate(productoActualizado.getElabDate());
        productoExistente.setCost(productoActualizado.getCost());
        productoExistente.setStock(productoActualizado.getStock());
        productoExistente.setCategory(productoActualizado.getCategory());
        productoExistente.setImage(productoActualizado.getImage());
        productoExistente.setActiveStatus(productoActualizado.getActiveStatus());
        productoExistente.setStockCritico(productoActualizado.getStockCritico());
        productoExistente.setProveedor(productoActualizado.getProveedor());
        
        // ✅ AGREGADO: campo destacado en la actualización
        productoExistente.setDestacado(productoActualizado.getDestacado());
        
        // creationDate NO se actualiza - es automático
        
        return productoRepository.save(productoExistente);
    }

    @Override
    public List<Producto> listarTodo() {
        return (List<Producto>) productoRepository.findAll();
    }
    
    @Override
    public void eliminar(Long id) {
        if (!productoRepository.existsById(id)) {
            throw new RuntimeException("Producto no encontrado.");
        } 
        productoRepository.deleteById(id);
    }

    /* ---------------------------------- Negocio ---------------------------------- */
    @Override
    public Producto desactivar(Long id) {
        Producto producto = obtenerPorID(id);
        producto.setActiveStatus(false);
        return productoRepository.save(producto);
    }

    @Override
    public Producto actualizarImagen(Long id, String imageUrl) {
        Producto producto = obtenerPorID(id);
        producto.setImage(imageUrl);
        return productoRepository.save(producto);
    }

    @Override
    public List<Producto> listarDestacados() {
        return productoRepository.findByDestacadoTrue();
    }

    /* ---------------------------------- FILTROS Y BÚSQUEDA ---------------------------------- */
    
    @Override
    public List<Producto> buscarPorNombre(String nombre) {
        return productoRepository.findByNameContainingIgnoreCase(nombre);
    }

    @Override
    public List<Producto> buscarPorCategoria(Long categoriaId) {
        return productoRepository.findByCategoryId(categoriaId);
    }

    @Override
    public List<Producto> buscarProductosStockBajo() {
        return productoRepository.findByStockLessThan(5); // Stock < 5 unidades
    }

    @Override
    public List<Producto> buscarPorEstado(Boolean activo) {
        return productoRepository.findByActiveStatus(activo);
    }

    @Override
    public List<Producto> buscarPorNombreYCategoria(String nombre, Long categoriaId) {
        return productoRepository.findByNameContainingIgnoreCaseAndCategoryId(nombre, categoriaId);
    }

    @Override
    public List<Producto> buscarPorNombreYEstado(String nombre, Boolean activo) {
        return productoRepository.findByNameContainingIgnoreCaseAndActiveStatus(nombre, activo);
    }
}