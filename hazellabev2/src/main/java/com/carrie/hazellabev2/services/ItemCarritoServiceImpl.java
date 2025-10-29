package com.carrie.hazellabev2.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.carrie.hazellabev2.entities.ItemCarrito;
import com.carrie.hazellabev2.repositories.ItemCarritoRepository;

@Service

public class ItemCarritoServiceImpl implements ItemCarritoService {
    @Autowired
    private ItemCarritoRepository itemCarritoRepository;

    @Override
    public ItemCarrito crear(ItemCarrito itemCarrito) {
        return itemCarritoRepository.save(itemCarrito);
    }; 

    @Override
    public ItemCarrito obtenerPorID(Long id) {
        return itemCarritoRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Item del carrito no encontrado."));
    };  

    @Override
    public ItemCarrito actualizar(Long id, ItemCarrito itemCarritoActualizado) {
        ItemCarrito itemCarritoExistente = obtenerPorID(id);
        itemCarritoExistente.setQuantity(itemCarritoActualizado.getQuantity());
        return itemCarritoRepository.save(itemCarritoExistente);
    };

    @Override
    public List<ItemCarrito> listarTodo() {
        return (List<ItemCarrito>) itemCarritoRepository.findAll();
    };

    @Override
    public void eliminar(Long id) {
        if (!itemCarritoRepository.existsById(id)) {
            throw new RuntimeException("Item del carrito no encontrado.");
        } itemCarritoRepository.deleteById(id);
    };

    @Override
    public List<ItemCarrito> listarPorUsuario(Long usuarioId) {
        return itemCarritoRepository.findByUsuarioId(usuarioId);
    }

    @Override
    public ItemCarrito actualizarCantidad(Long id, int nuevaCantidad) {
        ItemCarrito item = itemCarritoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Item no encontrado"));
        item.setQuantity(nuevaCantidad);
        return itemCarritoRepository.save(item);
}
}
