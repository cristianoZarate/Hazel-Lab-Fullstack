package com.carrie.hazellabev2.repositories;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

import com.carrie.hazellabev2.entities.Producto;

public interface ProductoRepository extends CrudRepository<Producto, Long> {
    List<Producto> findByDestacadoTrue();
    
    // ✅ NUEVOS MÉTODOS DE FILTRADO
    List<Producto> findByNameContainingIgnoreCase(String name);
    List<Producto> findByCategoryId(Long categoryId);
    List<Producto> findByStockLessThan(int stock);
    List<Producto> findByActiveStatus(Boolean activeStatus);
    
    // ✅ Métodos combinados para búsquedas avanzadas
    List<Producto> findByNameContainingIgnoreCaseAndCategoryId(String name, Long categoryId);
    List<Producto> findByNameContainingIgnoreCaseAndActiveStatus(String name, Boolean activeStatus);
}
