package com.carrie.hazellabev2.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.sql.Date;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.carrie.hazellabev2.entities.Categoria;
import com.carrie.hazellabev2.entities.Producto;
import com.carrie.hazellabev2.repositories.ProductoRepository;

public class ProductoServiceImplTest {
    
    @InjectMocks
    private ProductoServiceImpl service;
    
    @Mock
    private ProductoRepository repository;
    
    List<Producto> list = new ArrayList<Producto>();
    
    private Categoria categoriaLab;
    private Categoria categoriaFarma;

    @BeforeEach
    public void init(){
        MockitoAnnotations.openMocks(this);
        
        categoriaLab = new Categoria(1L, "Laboratorio", null);
        categoriaFarma = new Categoria(2L, "Farmacéutico", null);
        
        this.chargeProducto();
    }

    public void chargeProducto(){
        // Producto 1: Microscopio Digital de laboratorio (destacado)
        Producto producto1 = new Producto(1L, "Microscopio Digital", "BATCH001", "Microscopio profesional", "CHEM001", 
            Date.valueOf("2025-12-31"), Date.valueOf("2024-01-15"), 150000, 10, 2, "Proveedor LabTech S.A.", categoriaLab, "microscopio.jpg", true, LocalDateTime.now(), true);
        
        // Producto 2: Termómetro Clínico farmacéutico (no destacado)
        Producto producto2 = new Producto(2L, "Termómetro Clínico", "BATCH002", "Termómetro digital", "CHEM002", 
            Date.valueOf("2025-06-30"), Date.valueOf("2024-02-20"), 25000, 25, 5, "Proveedor Salud S.A.", categoriaFarma, "termometro.jpg", true, LocalDateTime.now(), false);
        
        // Producto 3: Centrífuga de laboratorio (destacado)
        Producto producto3 = new Producto(3L, "Centrífuga", "BATCH003", "Centrífuga de laboratorio", "CHEM003", 
            Date.valueOf("2026-03-15"), Date.valueOf("2024-03-10"), 300000, 5, 1, "Proveedor Equipos Científicos Ltda.", categoriaLab, "centrifuga.jpg", true, LocalDateTime.now(), true);

        list.add(producto1);
        list.add(producto2);
        list.add(producto3);
    }

    @Test
    public void productoListarTodoTest(){
        when(repository.findAll()).thenReturn(list);
        
        List<Producto> response = service.listarTodo();

        assertEquals(3, response.size());
        verify(repository, times(1)).findAll();
    }

    @Test
    public void productoObtenerPorIDTest(){
        Producto producto = new Producto(2L, "Termómetro Clínico", "BATCH002", "Termómetro digital", "CHEM002", 
            Date.valueOf("2025-06-30"), Date.valueOf("2024-02-20"), 25000, 25, 5, "Proveedor Salud S.A.", categoriaFarma, "termometro.jpg", true, LocalDateTime.now(), false);
        
        when(repository.findById(2L)).thenReturn(Optional.of(producto));

        Producto response = service.obtenerPorID(2L);

        assertNotNull(response);
        assertEquals("Termómetro Clínico", response.getName());
        assertEquals(25000, response.getCost());
        assertEquals(5, response.getStockCritico());
        assertEquals("Proveedor Salud S.A.", response.getProveedor());
        assertFalse(response.getDestacado());
        verify(repository, times(1)).findById(2L);
    }

    @Test
    public void productoObtenerPorIDNoExisteTest(){
        when(repository.findById(99L)).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> {
            service.obtenerPorID(99L);
        });

        assertEquals("Producto no encontrado.", exception.getMessage());
        verify(repository, times(1)).findById(99L);
    }

    @Test
    public void crearProductoTest(){
        // Producto sin ID (nuevo producto) - destacado
        Producto productoSinId = new Producto(null, "Nuevo Producto", "BATCH004", "Descripción nuevo", "CHEM004", 
            Date.valueOf("2025-12-31"), Date.valueOf("2024-04-01"), 50000, 15, 3, "Nuevo Proveedor S.L.", categoriaLab, "nuevo.jpg", true, null, true);
        
        // Producto con ID (después de ser guardado)
        Producto productoConId = new Producto(4L, "Nuevo Producto", "BATCH004", "Descripción nuevo", "CHEM004", 
            Date.valueOf("2025-12-31"), Date.valueOf("2024-04-01"), 50000, 15, 3, "Nuevo Proveedor S.L.", categoriaLab, "nuevo.jpg", true, LocalDateTime.now(), true);

        when(repository.save(any(Producto.class))).thenReturn(productoConId);

        Producto response = service.crear(productoSinId);

        assertNotNull(response);
        assertEquals(4L, response.getId());
        assertEquals("Nuevo Producto", response.getName());
        assertEquals(3, response.getStockCritico());
        assertEquals("Nuevo Proveedor S.L.", response.getProveedor());
        assertTrue(response.getDestacado());
        verify(repository, times(1)).save(any(Producto.class));
    }

    @Test
    public void actualizarProductoTest() {
        // Producto original en la base de datos (Centrífuga - destacado)
        Producto productoOriginal = new Producto(3L, "Centrífuga", "BATCH003", "Centrífuga de laboratorio", "CHEM003", 
            Date.valueOf("2026-03-15"), Date.valueOf("2024-03-10"), 300000, 5, 1, "Proveedor Equipos Científicos Ltda.", categoriaLab, "centrifuga.jpg", true, LocalDateTime.now(), true);
        
        // Producto con datos actualizados (Centrífuga Mejorada - sigue destacado)
        Producto productoActualizado = new Producto(3L, "Centrífuga Mejorada", "BATCH003", "Centrífuga mejorada", "CHEM003", 
            Date.valueOf("2026-03-15"), Date.valueOf("2024-03-10"), 350000, 8, 2, "Proveedor Equipos Científicos Premium Ltda.", categoriaLab, "centrifuga-mejorada.jpg", true, LocalDateTime.now(), true);

        when(repository.findById(3L)).thenReturn(Optional.of(productoOriginal));
        when(repository.save(any(Producto.class))).thenReturn(productoActualizado);

        Producto response = service.actualizar(3L, productoActualizado);

        assertNotNull(response);
        assertEquals("Centrífuga Mejorada", response.getName());
        assertEquals(350000, response.getCost());
        assertEquals(8, response.getStock());
        assertEquals(2, response.getStockCritico());
        assertEquals("Proveedor Equipos Científicos Premium Ltda.", response.getProveedor());
        assertTrue(response.getDestacado());
        
        verify(repository).findById(3L);
        verify(repository).save(any(Producto.class));
    }

    @Test
    public void eliminarProductoTest() {
        when(repository.existsById(4L)).thenReturn(true);

        service.eliminar(4L);

        verify(repository, times(1)).existsById(4L);
        verify(repository, times(1)).deleteById(4L);
    }

    @Test
    public void eliminarProductoNoExisteTest() {
        when(repository.existsById(99L)).thenReturn(false);

        Exception exception = assertThrows(RuntimeException.class, () -> {
            service.eliminar(99L);
        });

        assertEquals("Producto no encontrado.", exception.getMessage());
        verify(repository, times(1)).existsById(99L);
        verify(repository, times(0)).deleteById(anyLong());
    }

    @Test
    public void desactivarProductoTest() {
        Producto producto = new Producto(1L, "Microscopio Digital", "BATCH001", "Microscopio profesional", "CHEM001", 
            Date.valueOf("2025-12-31"), Date.valueOf("2024-01-15"), 150000, 10, 2, "Proveedor LabTech S.A.", categoriaLab, "microscopio.jpg", true, LocalDateTime.now(), true);

        when(repository.findById(1L)).thenReturn(Optional.of(producto));
        when(repository.save(any(Producto.class))).thenReturn(producto);

        Producto response = service.desactivar(1L);

        assertNotNull(response);
        assertFalse(response.getActiveStatus());
        assertTrue(response.getDestacado());
        
        verify(repository, times(1)).findById(1L);
        verify(repository, times(1)).save(any(Producto.class));
    }

    @Test
    public void actualizarImagenProductoTest() {
        Producto producto = new Producto(2L, "Termómetro Clínico", "BATCH002", "Termómetro digital", "CHEM002", 
            Date.valueOf("2025-06-30"), Date.valueOf("2024-02-20"), 25000, 25, 5, "Proveedor Salud S.A.", categoriaFarma, "termometro.jpg", true, LocalDateTime.now(), false);

        when(repository.findById(2L)).thenReturn(Optional.of(producto));
        when(repository.save(any(Producto.class))).thenReturn(producto);

        Producto response = service.actualizarImagen(2L, "nueva-imagen.jpg");

        assertNotNull(response);
        assertEquals("nueva-imagen.jpg", response.getImage());
        assertFalse(response.getDestacado());
        
        verify(repository, times(1)).findById(2L);
        verify(repository, times(1)).save(any(Producto.class));
    }

    @Test
    public void listarProductosDestacadosTest() {
        List<Producto> productosDestacados = list.stream()
                .filter(p -> p.getDestacado())
                .toList();

        when(repository.findByDestacadoTrue()).thenReturn(productosDestacados);

        List<Producto> response = service.listarDestacados();

        assertEquals(2, response.size());
        assertTrue(response.get(0).getDestacado());
        assertTrue(response.get(1).getDestacado());
        verify(repository, times(1)).findByDestacadoTrue();
    }


    @Test
    public void buscarPorNombreTest() {
        String nombreBusqueda = "microscopio";
        List<Producto> productosFiltrados = list.stream()
                .filter(p -> p.getName().toLowerCase().contains(nombreBusqueda.toLowerCase()))
                .toList();

        when(repository.findByNameContainingIgnoreCase(nombreBusqueda)).thenReturn(productosFiltrados);

        List<Producto> response = service.buscarPorNombre(nombreBusqueda);

        assertEquals(1, response.size());
        assertEquals("Microscopio Digital", response.get(0).getName());
        verify(repository, times(1)).findByNameContainingIgnoreCase(nombreBusqueda);
    }

    @Test
    public void buscarPorCategoriaTest() {
        Long categoriaId = 1L; // Laboratorio
        List<Producto> productosFiltrados = list.stream()
                .filter(p -> p.getCategory().getId().equals(categoriaId))
                .toList();

        when(repository.findByCategoryId(categoriaId)).thenReturn(productosFiltrados);

        List<Producto> response = service.buscarPorCategoria(categoriaId);

        assertEquals(2, response.size()); // Microscopio y Centrífuga
        assertTrue(response.stream().allMatch(p -> p.getCategory().getId().equals(categoriaId)));
        verify(repository, times(1)).findByCategoryId(categoriaId);
    }

    @Test
    public void buscarProductosStockBajoTest() {
        // Productos con stock < 5
        List<Producto> productosStockBajo = list.stream()
                .filter(p -> p.getStock() < 5)
                .toList();

        when(repository.findByStockLessThan(5)).thenReturn(productosStockBajo);

        List<Producto> response = service.buscarProductosStockBajo();

        assertEquals(1, response.size()); // Solo la Centrífuga tiene stock 5
        assertEquals("Centrífuga", response.get(0).getName());
        assertEquals(5, response.get(0).getStock()); // Stock = 5 (no menor que 5)
        verify(repository, times(1)).findByStockLessThan(5);
    }

    @Test
    public void buscarPorEstadoTest() {
        Boolean activo = true;
        List<Producto> productosActivos = list.stream()
                .filter(p -> p.getActiveStatus().equals(activo))
                .toList();

        when(repository.findByActiveStatus(activo)).thenReturn(productosActivos);

        List<Producto> response = service.buscarPorEstado(activo);

        assertEquals(3, response.size()); // Todos están activos
        assertTrue(response.stream().allMatch(Producto::getActiveStatus));
        verify(repository, times(1)).findByActiveStatus(activo);
    }

    @Test
    public void buscarPorNombreYCategoriaTest() {
        String nombre = "centrífuga";
        Long categoriaId = 1L;
        List<Producto> productosFiltrados = list.stream()
                .filter(p -> p.getName().toLowerCase().contains(nombre.toLowerCase()) && 
                            p.getCategory().getId().equals(categoriaId))
                .toList();

        when(repository.findByNameContainingIgnoreCaseAndCategoryId(nombre, categoriaId))
                .thenReturn(productosFiltrados);

        List<Producto> response = service.buscarPorNombreYCategoria(nombre, categoriaId);

        assertEquals(1, response.size());
        assertEquals("Centrífuga", response.get(0).getName());
        assertEquals(categoriaId, response.get(0).getCategory().getId());
        verify(repository, times(1)).findByNameContainingIgnoreCaseAndCategoryId(nombre, categoriaId);
    }

    @Test
    public void buscarPorNombreYEstadoTest() {
        String nombre = "termómetro";
        Boolean activo = true;
        List<Producto> productosFiltrados = list.stream()
                .filter(p -> p.getName().toLowerCase().contains(nombre.toLowerCase()) && 
                            p.getActiveStatus().equals(activo))
                .toList();

        when(repository.findByNameContainingIgnoreCaseAndActiveStatus(nombre, activo))
                .thenReturn(productosFiltrados);

        List<Producto> response = service.buscarPorNombreYEstado(nombre, activo);

        assertEquals(1, response.size());
        assertEquals("Termómetro Clínico", response.get(0).getName());
        assertTrue(response.get(0).getActiveStatus());
        verify(repository, times(1)).findByNameContainingIgnoreCaseAndActiveStatus(nombre, activo);
    }
}