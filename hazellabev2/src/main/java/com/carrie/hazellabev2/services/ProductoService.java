package com.carrie.hazellabev2.services;

import java.util.List;

import com.carrie.hazellabev2.entities.Producto;

public interface ProductoService {
    /* ---------------------------------- CRUD simple ---------------------------------- */
    Producto crear(Producto producto);
    Producto obtenerPorID(Long id);    
    Producto actualizar(Long id, Producto productoActualizado);
    List<Producto> listarTodo();
    void eliminar(Long id);

    /* ---------------------------------- Negocio ---------------------------------- */
    Producto desactivar(Long id);
    Producto actualizarImagen(Long id, String imageUrl);
    List<Producto> listarDestacados();
    
    /* ---------------------------------- FILTROS Y BÚSQUEDA ---------------------------------- */
    List<Producto> buscarPorNombre(String nombre);
    List<Producto> buscarPorCategoria(Long categoriaId);
    List<Producto> buscarProductosStockBajo();
    List<Producto> buscarPorEstado(Boolean activo);
    List<Producto> buscarPorNombreYCategoria(String nombre, Long categoriaId);
    List<Producto> buscarPorNombreYEstado(String nombre, Boolean activo);
}