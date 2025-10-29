package com.carrie.hazellabev2.services;

import java.util.List;

import com.carrie.hazellabev2.entities.ItemCarrito;

public interface ItemCarritoService {
    ItemCarrito crear(ItemCarrito itemCarrito);
    ItemCarrito obtenerPorID(Long id);    
    ItemCarrito actualizar(Long id, ItemCarrito itemCarritoActualizado);
    List<ItemCarrito> listarTodo();
    void eliminar(Long id);
    /* ---------------------------------- Negocio ---------------------------------- */
    List<ItemCarrito> listarPorUsuario(Long usuarioId);
    ItemCarrito actualizarCantidad(Long id, int nuevaCantidad);
}
