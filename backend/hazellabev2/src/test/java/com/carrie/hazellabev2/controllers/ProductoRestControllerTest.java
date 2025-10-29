package com.carrie.hazellabev2.controllers;

import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.sql.Date;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.carrie.hazellabev2.entities.Categoria;
import com.carrie.hazellabev2.entities.Producto;
import com.carrie.hazellabev2.services.ProductoService;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
public class ProductoRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductoService productoService;

    /* =========================================================
       🧪 TEST: Listar productos
    ========================================================= */
    @Test
    public void listarProductosTest() throws Exception {
        Categoria cat = new Categoria(1L, "Químicos", null);
        Producto prod1 = new Producto(1L, "Ácido Clorhídrico", "Lote001", "Solución corrosiva", "HCL001",
                Date.valueOf("2026-12-31"), Date.valueOf("2024-01-01"),
                5000, 20, 5, "Proveedor Químico S.A.", cat, "imagen1.jpg",
                true, LocalDateTime.now(), true);
        Producto prod2 = new Producto(2L, "Etanol", "Lote002", "Alcohol 96%", "ETH002",
                Date.valueOf("2027-06-30"), Date.valueOf("2024-02-01"),
                3000, 40, 10, "Distribuidora Alcoholes Ltda.", cat, "imagen2.jpg",
                true, LocalDateTime.now(), false);

        when(productoService.listarTodo()).thenReturn(Arrays.asList(prod1, prod2));

        mockMvc.perform(get("/api/productos")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    /* =========================================================
       🧪 TEST: Obtener producto por ID
    ========================================================= */
    @Test
    public void obtenerProductoPorIdTest() {
        Categoria cat = new Categoria(1L, "Químicos", null);
        Producto producto = new Producto(1L, "Ácido Clorhídrico", "Lote001",
                "Solución corrosiva", "HCL001",
                Date.valueOf("2026-12-31"), Date.valueOf("2024-01-01"),
                5000, 20, 5, "Proveedor Químico S.A.", cat,
                "imagen1.jpg", true, LocalDateTime.now(), true);

        try {
            when(productoService.obtenerPorID(1L)).thenReturn(producto);
            mockMvc.perform(get("/api/productos/1")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());
        } catch (Exception ex) {
            fail("Error en obtenerProductoPorIdTest: " + ex.getMessage());
        }
    }

    /* =========================================================
       🧪 TEST: Producto no existente
    ========================================================= */
    @Test
    public void productoNoExisteTest() throws Exception {
        when(productoService.obtenerPorID(99L))
                .thenThrow(new RuntimeException("Producto no encontrado."));

        mockMvc.perform(get("/api/productos/99")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());
    }

    /* =========================================================
       🧪 TEST: Crear producto
    ========================================================= */
    @Test
    public void crearProductoTest() throws Exception {
        Categoria cat = new Categoria(1L, "Químicos", null);
        Producto nuevo = new Producto(null, "Nuevo Reactivo", "Lote003", "Reactivo nuevo", "NEW003",
                Date.valueOf("2028-01-01"), Date.valueOf("2025-01-01"),
                7000, 10, 3, "Nuevo Proveedor S.A.", cat, "imagen3.jpg",
                true, null, true);
        Producto guardado = new Producto(3L, "Nuevo Reactivo", "Lote003", "Reactivo nuevo", "NEW003",
                Date.valueOf("2028-01-01"), Date.valueOf("2025-01-01"),
                7000, 10, 3, "Nuevo Proveedor S.A.", cat, "imagen3.jpg",
                true, LocalDateTime.now(), true);

        when(productoService.crear(org.mockito.ArgumentMatchers.any(Producto.class))).thenReturn(guardado);

        mockMvc.perform(post("/api/productos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevo)))
                .andExpect(status().isOk());
    }

    /* =========================================================
       🧪 TEST: Actualizar producto existente
    ========================================================= */
    @Test
    public void actualizarProductoExistenteTest() throws Exception {
        Categoria cat = new Categoria(1L, "Químicos", null);
        Long id = 1L;
        Producto actualizado = new Producto(id, "Etanol Puro", "Lote002",
                "Alcohol refinado", "ETH002",
                Date.valueOf("2027-06-30"), Date.valueOf("2024-02-01"),
                3200, 35, 8, "Distribuidora Alcoholes Premium Ltda.", cat,
                "imagen2.jpg", true, LocalDateTime.now(), true);

        when(productoService.actualizar(org.mockito.ArgumentMatchers.eq(id),
                org.mockito.ArgumentMatchers.any(Producto.class))).thenReturn(actualizado);

        mockMvc.perform(put("/api/productos/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(actualizado)))
                .andExpect(status().isOk());
    }

    /* =========================================================
       🧪 TEST: Actualizar producto no existente
    ========================================================= */
    @Test
    public void actualizarProductoNoExisteTest() throws Exception {
        Categoria cat = new Categoria(1L, "Químicos", null);
        Long id = 99L;
        Producto producto = new Producto(id, "No Existe", "Lote999", "Producto falso", "ERR999",
                Date.valueOf("2029-01-01"), Date.valueOf("2025-01-01"),
                1000, 0, 0, "Proveedor Inexistente", cat,
                "img.jpg", true, LocalDateTime.now(), false);

        when(productoService.actualizar(org.mockito.ArgumentMatchers.eq(id),
                org.mockito.ArgumentMatchers.any(Producto.class)))
                .thenThrow(new RuntimeException("Producto no encontrado."));

        mockMvc.perform(put("/api/productos/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(producto)))
                .andExpect(status().isInternalServerError());
    }

    /* =========================================================
       🧪 TEST: Eliminar producto existente
    ========================================================= */
    @Test
    public void eliminarProductoTest() throws Exception {
        when(productoService.obtenerPorID(1L))
                .thenReturn(new Producto(1L, "Ácido Clorhídrico", "Lote001", "Solución corrosiva", "HCL001",
                        Date.valueOf("2026-12-31"), Date.valueOf("2024-01-01"),
                        5000, 20, 5, "Proveedor Químico S.A.", null,
                        "imagen1.jpg", true, LocalDateTime.now(), true));

        mockMvc.perform(delete("/api/productos/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());
    }

    /* =========================================================
       🧪 TEST: Eliminar producto inexistente
    ========================================================= */
    @Test
    public void eliminarProductoNoExisteTest() throws Exception {
        doThrow(new RuntimeException("Producto no encontrado."))
                .when(productoService).eliminar(99L);

        mockMvc.perform(delete("/api/productos/99")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());
    }

    /* =========================================================
       🧪 TEST: Listar productos destacados
    ========================================================= */
    @Test
    public void listarProductosDestacadosTest() throws Exception {
        Categoria cat = new Categoria(1L, "Químicos", null);
        Producto prod1 = new Producto(1L, "Reactivo Premium", "Lote005", "Alta pureza", "PREM001",
                Date.valueOf("2027-12-31"), Date.valueOf("2024-03-01"),
                12000, 15, 3, "Proveedor Premium S.A.", cat,
                "imagen5.jpg", true, LocalDateTime.now(), true);
        when(productoService.listarDestacados()).thenReturn(List.of(prod1));

        mockMvc.perform(get("/api/productos/destacados")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    /* =========================================================
       🧪 TEST: Desactivar producto (PATCH)
    ========================================================= */
    @Test
    public void desactivarProductoTest() throws Exception {
        Long id = 1L;
        Categoria cat = new Categoria(1L, "Químicos", null);
        Producto desactivado = new Producto(id, "Etanol", "Lote002", "Alcohol", "ETH002",
                Date.valueOf("2027-06-30"), Date.valueOf("2024-02-01"),
                3000, 40, 10, "Distribuidora Alcoholes Ltda.", cat,
                "imagen2.jpg", false, LocalDateTime.now(), false);

        when(productoService.desactivar(id)).thenReturn(desactivado);

        mockMvc.perform(patch("/api/productos/{id}/desactivar", id)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    /* =========================================================
       🧪 TEST: Subir imagen (POST /upload-image)
    ========================================================= */
    @Test
    public void uploadImageProductoTest() throws Exception {
        Long id = 1L;
        Categoria cat = new Categoria(1L, "Químicos", null);
        Producto producto = new Producto(id, "Etanol", "Lote002", "Alcohol", "ETH002",
                Date.valueOf("2027-06-30"), Date.valueOf("2024-02-01"),
                3000, 40, 10, "Distribuidora Alcoholes Ltda.", cat,
                "nueva-imagen.jpg", true, LocalDateTime.now(), false);

        when(productoService.obtenerPorID(id)).thenReturn(producto);
        when(productoService.actualizar(org.mockito.ArgumentMatchers.eq(id),
                org.mockito.ArgumentMatchers.any(Producto.class))).thenReturn(producto);

        mockMvc.perform(post("/api/productos/{id}/upload-image", id)
                .param("imageUrl", "http://imagenes.com/img.jpg")
                .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk());
    }
}
