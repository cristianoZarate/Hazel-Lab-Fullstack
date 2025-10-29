package com.carrie.hazellabev2.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.carrie.hazellabev2.entities.ItemCarrito;
import com.carrie.hazellabev2.services.ItemCarritoService;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/itemscarrito")
public class ItemCarritoRestController {

    @Autowired
    private ItemCarritoService itemCarritoService;

    // 🔹 Crear nuevo item en el carrito
    @PostMapping
    public ResponseEntity<ItemCarrito> crearItemCarrito(@RequestBody ItemCarrito itemCarrito) {
        ItemCarrito nuevoItemCarrito = itemCarritoService.crear(itemCarrito);
        return ResponseEntity.ok(nuevoItemCarrito);
    }

    // 🔹 Obtener item por ID
    @GetMapping("/{id}")
    public ResponseEntity<ItemCarrito> obtenerItemCarritoPorId(@PathVariable Long id) {
        ItemCarrito itemCarrito = itemCarritoService.obtenerPorID(id);
        return ResponseEntity.ok(itemCarrito);
    }

    // 🔹 Listar todos los items del carrito (modo admin)
    @GetMapping
    public ResponseEntity<List<ItemCarrito>> listarItemsCarrito() {
        List<ItemCarrito> itemsCarrito = itemCarritoService.listarTodo();
        return ResponseEntity.ok(itemsCarrito);
    }

    // 🔹 Eliminar un item del carrito
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarItemCarrito(@PathVariable Long id) {
        itemCarritoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    // 🔹 Listar items de un usuario específico
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<ItemCarrito>> listarPorUsuario(@PathVariable Long usuarioId) {
        List<ItemCarrito> items = itemCarritoService.listarPorUsuario(usuarioId);

        // 👇 Forzar carga de producto (evita errores de lazy loading)
        items.forEach(item -> {
            if (item.getProducto() != null) {
                item.getProducto().getName();
            }
        });

        return ResponseEntity.ok(items);
    }

    // 🔹 Actualizar todo el item (por ejemplo, cambiar producto o cantidad)
    @PutMapping("/{id}")
    public ResponseEntity<ItemCarrito> actualizarItemCarrito(
            @PathVariable Long id,
            @RequestBody ItemCarrito itemCarritoActualizado) {

        ItemCarrito itemCarrito = itemCarritoService.actualizar(id, itemCarritoActualizado);
        return ResponseEntity.ok(itemCarrito);
    }

    // 🔹 Actualizar SOLO la cantidad de un item
    @PutMapping("/{id}/cantidad")
    public ResponseEntity<ItemCarrito> actualizarCantidad(
            @PathVariable Long id,
            @RequestBody ItemCarrito item) {

        ItemCarrito actualizado = itemCarritoService.actualizarCantidad(id, item.getQuantity());
        return ResponseEntity.ok(actualizado);
    }
}
