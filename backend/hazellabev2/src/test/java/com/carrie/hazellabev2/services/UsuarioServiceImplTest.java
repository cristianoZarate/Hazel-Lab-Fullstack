package com.carrie.hazellabev2.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.carrie.hazellabev2.entities.Usuario;
import com.carrie.hazellabev2.repositories.UsuarioRepository;

public class UsuarioServiceImplTest {
    
    @InjectMocks
    private UsuarioServiceImpl service;
    
    @Mock
    private UsuarioRepository repository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    List<Usuario> list = new ArrayList<Usuario>();

    @BeforeEach
    public void init() {
        MockitoAnnotations.openMocks(this);
        this.chargeUsuario();
    }

    public void chargeUsuario() {
        // ACTUALIZADO: usuarios con todos los campos nuevos
        Usuario usuario1 = new Usuario(1L, "adminpPrueba", "adminprueba@duoc.cl", "12345678-9", "password123", 
                                      "super_admin", "activo", LocalDateTime.now(), 
                                      "Metropolitana", "Santiago", "Admin", "1985-01-01", "Dirección 123", null);
        Usuario usuario2 = new Usuario(2L, "vendedorPrueba", "vendedorprueba@duoc.cl", "98765432-1", "password456", 
                                      "vendedor", "activo", LocalDateTime.now(), 
                                      "Valparaíso", "Viña del Mar", "Vendedor", "1990-02-02", "Calle 456", null);
        Usuario usuario3 = new Usuario(3L, "clientePrueba", "clienteprueba@gmail.com", "11222333-4", "password789", 
                                      "cliente", "activo", LocalDateTime.now(), 
                                      "Biobío", "Concepción", "Cliente", "1995-03-03", "Av. Principal 789", null);

        list.add(usuario1);
        list.add(usuario2);
        list.add(usuario3);
    }

    @Test
    public void usuarioListarTodoTest() {
        when(repository.findAll()).thenReturn(list);
        
        List<Usuario> response = service.listarTodo();

        assertEquals(3, response.size());
        verify(repository, times(1)).findAll();
    }

    @Test
    public void usuarioObtenerPorIDTest() {
        // ACTUALIZADO: usuario con todos los campos
        Usuario usuario = new Usuario(2L, "vendedor1", "vendedor1@duoc.cl", "98765432-1", "password456", 
                                    "vendedor", "activo", LocalDateTime.now(),
                                    "Valparaíso", "Viña del Mar", "Vendedor Apellido", "1990-02-02", "Calle 456", null);
        
        when(repository.findById(2L)).thenReturn(Optional.of(usuario));

        Usuario response = service.obtenerPorID(2L);

        assertNotNull(response);
        assertEquals("vendedor1", response.getUsername());
        assertEquals("98765432-1", response.getRut());
        assertEquals("Vendedor Apellido", response.getApellidos());
        assertEquals("Valparaíso", response.getRegion());
        assertEquals("Viña del Mar", response.getComuna());
        verify(repository, times(1)).findById(2L);
    }

    @Test
    public void usuarioObtenerPorIDNoExisteTest() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> {
            service.obtenerPorID(99L);
        });

        assertEquals("Usuario no encontrado.", exception.getMessage());
        verify(repository, times(1)).findById(99L);
    }

    @Test
    public void crearUsuarioTest() {
        // ACTUALIZADO: usuario con todos los campos
        Usuario usuarioSinId = new Usuario(null, "nuevo", "nuevo@duoc.cl", "12345678-9", "password123", 
                                          "vendedor", "activo", null,
                                          "Metropolitana", "Santiago", "Nuevo Apellido", "1990-01-01", "Av. Nueva 123", null);
        Usuario usuarioConId = new Usuario(4L, "nuevo", "nuevo@duoc.cl", "12345678-9", "passwordEncriptado", 
                                          "vendedor", "activo", LocalDateTime.now(),
                                          "Metropolitana", "Santiago", "Nuevo Apellido", "1990-01-01", "Av. Nueva 123", null);

        when(passwordEncoder.encode("password123")).thenReturn("passwordEncriptado");
        when(repository.save(any(Usuario.class))).thenReturn(usuarioConId);

        Usuario response = service.crear(usuarioSinId);

        assertNotNull(response);
        assertEquals(4L, response.getId());
        assertEquals("nuevo", response.getUsername());
        assertEquals("12345678-9", response.getRut());
        assertEquals("Nuevo Apellido", response.getApellidos());
        assertEquals("Metropolitana", response.getRegion());
        assertEquals("Santiago", response.getComuna());
        
        verify(repository, times(1)).save(any(Usuario.class));
        verify(passwordEncoder, times(1)).encode("password123");
    }

    @Test
    public void crearUsuarioSinRutTest() {
        // NUEVO TEST: validar creación sin RUT
        Usuario usuarioSinRut = new Usuario(null, "nuevo", "nuevo@duoc.cl", null, "password123", 
                                           "vendedor", "activo", null, null, null, null, null, null, null);

        Exception exception = assertThrows(RuntimeException.class, () -> {
            service.crear(usuarioSinRut);
        });

        assertEquals("El RUT es obligatorio", exception.getMessage());
        verify(repository, times(0)).save(any(Usuario.class));
    }

    @Test
    public void crearUsuarioConRutVacioTest() {
        // NUEVO TEST: validar RUT vacío
        Usuario usuarioRutVacio = new Usuario(null, "nuevo", "nuevo@duoc.cl", "", "password123", 
                                             "vendedor", "activo", null, null, null, null, null, null, null);

        Exception exception = assertThrows(RuntimeException.class, () -> {
            service.crear(usuarioRutVacio);
        });

        assertEquals("El RUT es obligatorio", exception.getMessage());
        verify(repository, times(0)).save(any(Usuario.class));
    }

    @Test
    public void crearUsuarioSinPasswordTest() {
        // NUEVO TEST: validar password nula
        Usuario usuarioSinPassword = new Usuario(null, "nuevo", "nuevo@duoc.cl", "12345678-9", null, 
                                                "vendedor", "activo", null, null, null, null, null, null, null);

        Exception exception = assertThrows(RuntimeException.class, () -> {
            service.crear(usuarioSinPassword);
        });

        assertEquals("La contraseña no puede ser nula o vacía", exception.getMessage());
        verify(repository, times(0)).save(any(Usuario.class));
    }

    @Test
    public void crearUsuarioConValoresPorDefectoTest() {
        // NUEVO TEST: verificar asignación de valores por defecto
        Usuario usuarioMinimo = new Usuario(null, "usuarioMinimo", "minimo@duoc.cl", "12345678-9", "password123", 
                                           null, null, null, null, null, null, null, null, null);
        Usuario usuarioConId = new Usuario(5L, "usuarioMinimo", "minimo@duoc.cl", "12345678-9", "passwordEncriptado", 
                                          "cliente", "activo", LocalDateTime.now(), "", "", "", null, "", null);

        when(passwordEncoder.encode("password123")).thenReturn("passwordEncriptado");
        when(repository.save(any(Usuario.class))).thenReturn(usuarioConId);

        Usuario response = service.crear(usuarioMinimo);

        assertNotNull(response);
        assertEquals("cliente", response.getRole()); // Valor por defecto
        assertEquals("activo", response.getStatus()); // Valor por defecto
        assertNotNull(response.getCreatedAt()); // Debe tener fecha de creación
        
        verify(repository, times(1)).save(any(Usuario.class));
    }

    @Test
    public void crearUsuarioConNuevosCamposTest() {
        // NUEVO TEST: Usuario con todos los nuevos campos
        Usuario usuarioCompleto = new Usuario(
            null, "nuevo", "nuevo@duoc.cl", "12345678-9", "password123", 
            "vendedor", "activo", null, 
            "Metropolitana", "Santiago", "Pérez", "1990-01-01", "Av. Principal 123", null
        );
        
        Usuario usuarioGuardado = new Usuario(
            4L, "nuevo", "nuevo@duoc.cl", "12345678-9", "passwordEncriptado", 
            "vendedor", "activo", LocalDateTime.now(),
            "Metropolitana", "Santiago", "Pérez", "1990-01-01", "Av. Principal 123", null
        );

        when(passwordEncoder.encode("password123")).thenReturn("passwordEncriptado");
        when(repository.save(any(Usuario.class))).thenReturn(usuarioGuardado);

        Usuario response = service.crear(usuarioCompleto);

        assertNotNull(response);
        assertEquals("Metropolitana", response.getRegion());
        assertEquals("Santiago", response.getComuna());
        assertEquals("Pérez", response.getApellidos());
        assertEquals("1990-01-01", response.getFechaNacimiento());
        assertEquals("Av. Principal 123", response.getDireccion());
    }

    @Test
    public void crearUsuarioEmailInvalidoTest() {
        // NUEVO TEST: validar email inválido
        Usuario usuarioEmailInvalido = new Usuario(
            null, "nuevo", "nuevo@yahoo.com", "12345678-9", "password123", 
            "vendedor", "activo", null, null, null, null, null, null, null
        );

        Exception exception = assertThrows(RuntimeException.class, () -> {
            service.crear(usuarioEmailInvalido);
        });

        assertEquals("El correo debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com", exception.getMessage());
        verify(repository, times(0)).save(any(Usuario.class));
    }

    @Test
    public void crearUsuarioEmailProfesorValidoTest() {
        // NUEVO TEST: validar email de profesor válido
        Usuario usuarioEmailProfesor = new Usuario(
            null, "profesor", "profesor@profesor.duoc.cl", "12345678-9", "password123", 
            "vendedor", "activo", null, null, null, null, null, null, null
        );
        
        Usuario usuarioGuardado = new Usuario(
            6L, "profesor", "profesor@profesor.duoc.cl", "12345678-9", "passwordEncriptado", 
            "vendedor", "activo", LocalDateTime.now(), null, null, null, null, null, null
        );

        when(passwordEncoder.encode("password123")).thenReturn("passwordEncriptado");
        when(repository.save(any(Usuario.class))).thenReturn(usuarioGuardado);

        Usuario response = service.crear(usuarioEmailProfesor);

        assertNotNull(response);
        assertEquals("profesor@profesor.duoc.cl", response.getEmail());
        verify(repository, times(1)).save(any(Usuario.class));
    }

    @Test
    public void crearUsuarioEmailGmailValidoTest() {
        // NUEVO TEST: validar email gmail válido
        Usuario usuarioEmailGmail = new Usuario(
            null, "usuario", "usuario@gmail.com", "12345678-9", "password123", 
            "vendedor", "activo", null, null, null, null, null, null, null
        );
        
        Usuario usuarioGuardado = new Usuario(
            7L, "usuario", "usuario@gmail.com", "12345678-9", "passwordEncriptado", 
            "vendedor", "activo", LocalDateTime.now(), null, null, null, null, null, null
        );

        when(passwordEncoder.encode("password123")).thenReturn("passwordEncriptado");
        when(repository.save(any(Usuario.class))).thenReturn(usuarioGuardado);

        Usuario response = service.crear(usuarioEmailGmail);

        assertNotNull(response);
        assertEquals("usuario@gmail.com", response.getEmail());
        verify(repository, times(1)).save(any(Usuario.class));
    }

    @Test
    public void actualizarUsuarioTest() {
        // ACTUALIZADO: incluir todos los campos nuevos
        Usuario usuarioOriginal = new Usuario(3L, "cliente1", "cliente1@gmail.com", "11222333-4", "password789", 
                                             "cliente", "activo", LocalDateTime.now(),
                                             "Biobío", "Concepción", "Cliente Original", "1995-03-03", "Dirección Original", null);
        Usuario usuarioActualizado = new Usuario(3L, "clienteModificado", "clienteModificado@gmail.com", "99888777-6", 
                                                "nuevaPassword", "cliente", "inactivo", LocalDateTime.now(),
                                                "Metropolitana", "Santiago", "Cliente Modificado", "1990-01-01", "Nueva Dirección", null);

        when(repository.findById(3L)).thenReturn(Optional.of(usuarioOriginal));
        when(repository.save(any(Usuario.class))).thenReturn(usuarioActualizado);

        Usuario response = service.actualizar(3L, usuarioActualizado);

        assertNotNull(response);
        assertEquals("clienteModificado", response.getUsername());
        assertEquals("clienteModificado@gmail.com", response.getEmail());
        assertEquals("99888777-6", response.getRut());
        assertEquals("Cliente Modificado", response.getApellidos());
        assertEquals("Metropolitana", response.getRegion());
        assertEquals("Santiago", response.getComuna());
        assertEquals("Nueva Dirección", response.getDireccion());
        
        verify(repository).findById(3L);
        verify(repository).save(any(Usuario.class));
    }

    @Test
    public void actualizarUsuarioSinCambiarPasswordTest() {
        // NUEVO TEST: actualizar sin cambiar password
        Usuario usuarioOriginal = new Usuario(3L, "cliente1", "cliente1@gmail.com", "11222333-4", "passwordEncriptado", 
                                             "cliente", "activo", LocalDateTime.now(), null, null, null, null, null, null);
        Usuario usuarioActualizado = new Usuario(3L, "clienteModificado", "clienteModificado@gmail.com", "99888777-6", 
                                                "passwordEncriptado", "cliente", "inactivo", LocalDateTime.now(), null, null, null, null, null, null);

        when(repository.findById(3L)).thenReturn(Optional.of(usuarioOriginal));
        when(repository.save(any(Usuario.class))).thenReturn(usuarioActualizado);

        Usuario response = service.actualizar(3L, usuarioActualizado);

        assertNotNull(response);
        // No debería llamar al passwordEncoder cuando la password no cambia
        verify(passwordEncoder, times(0)).encode(anyString());
    }

    @Test
    public void actualizarUsuarioConNuevaPasswordTest() {
        // NUEVO TEST: actualizar con nueva password
        Usuario usuarioOriginal = new Usuario(3L, "cliente1", "cliente1@gmail.com", "11222333-4", "passwordViejaEncriptada", 
                                             "cliente", "activo", LocalDateTime.now(), null, null, null, null, null, null);
        Usuario usuarioActualizado = new Usuario(3L, "clienteModificado", "clienteModificado@gmail.com", "99888777-6", 
                                                "nuevaPassword", "cliente", "inactivo", LocalDateTime.now(), null, null, null, null, null, null);

        when(repository.findById(3L)).thenReturn(Optional.of(usuarioOriginal));
        when(passwordEncoder.encode("nuevaPassword")).thenReturn("nuevaPasswordEncriptada");
        when(repository.save(any(Usuario.class))).thenReturn(usuarioActualizado);

        Usuario response = service.actualizar(3L, usuarioActualizado);

        assertNotNull(response);
        verify(passwordEncoder, times(1)).encode("nuevaPassword");
    }

    @Test
    public void actualizarUsuarioEmailInvalidoTest() {
        // NUEVO TEST: actualizar con email inválido
        Usuario usuarioOriginal = new Usuario(3L, "cliente1", "cliente1@gmail.com", "11222333-4", "password789", 
                                             "cliente", "activo", LocalDateTime.now(), null, null, null, null, null, null);
        Usuario usuarioActualizado = new Usuario(3L, "clienteModificado", "clienteModificado@yahoo.com", "99888777-6", 
                                                "nuevaPassword", "cliente", "inactivo", LocalDateTime.now(), null, null, null, null, null, null);

        when(repository.findById(3L)).thenReturn(Optional.of(usuarioOriginal));

        Exception exception = assertThrows(RuntimeException.class, () -> {
            service.actualizar(3L, usuarioActualizado);
        });

        assertEquals("El correo debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com", exception.getMessage());
        verify(repository, times(0)).save(any(Usuario.class));
    }

    @Test
    public void eliminarUsuarioTest() {
        when(repository.existsById(4L)).thenReturn(true);

        service.eliminar(4L);

        verify(repository, times(1)).existsById(4L);
        verify(repository, times(1)).deleteById(4L);
    }

    @Test
    public void eliminarUsuarioNoExisteTest() {
        when(repository.existsById(99L)).thenReturn(false);

        Exception exception = assertThrows(RuntimeException.class, () -> {
            service.eliminar(99L);
        });

        assertEquals("Usuario no encontrado.", exception.getMessage());
        verify(repository, times(1)).existsById(99L);
        verify(repository, times(0)).deleteById(99L);
    }

    @Test
    public void findByEmailTest() {
        // ACTUALIZADO: agregar todos los campos
        Usuario usuario = new Usuario(1L, "admin", "admin@duoc.cl", "12345678-9", "password123", 
                                    "super_admin", "activo", LocalDateTime.now(),
                                    "Metropolitana", "Santiago", "Administrador", "1985-01-01", "Dirección Admin", null);
        
        when(repository.findByEmail("admin@duoc.cl")).thenReturn(Optional.of(usuario));

        Usuario response = service.findByEmail("admin@duoc.cl");

        assertNotNull(response);
        assertEquals("admin", response.getUsername());
        assertEquals("12345678-9", response.getRut());
        assertEquals("Administrador", response.getApellidos());
        verify(repository, times(1)).findByEmail("admin@duoc.cl");
    }

    @Test
    public void findByEmailNoExisteTest() {
        when(repository.findByEmail(anyString())).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> {
            service.findByEmail("noexiste@duoc.cl");
        });

        assertEquals("Usuario no encontrado", exception.getMessage());
        verify(repository, times(1)).findByEmail("noexiste@duoc.cl");
    }

    @Test
    public void validarPasswordTest() {
        when(passwordEncoder.matches("password123", "passwordEncriptado")).thenReturn(true);

        boolean resultado = service.validarPassword("password123", "passwordEncriptado");

        assertTrue(resultado);
        verify(passwordEncoder, times(1)).matches("password123", "passwordEncriptado");
    }

    @Test
    public void loginExitosoTest() {
        // ACTUALIZADO: agregar todos los campos
        Usuario usuario = new Usuario(1L, "admin", "admin@duoc.cl", "12345678-9", "passwordEncriptado", 
                                    "super_admin", "activo", LocalDateTime.now(),
                                    "Metropolitana", "Santiago", "Admin", "1985-01-01", "Dirección 123", null);
        
        when(repository.findByEmail("admin@duoc.cl")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("password123", "passwordEncriptado")).thenReturn(true);

        Usuario response = service.login("admin@duoc.cl", "password123");

        assertNotNull(response);
        assertEquals("admin", response.getUsername());
        assertEquals("12345678-9", response.getRut());
        assertEquals("Admin", response.getApellidos());
        
        verify(repository, times(1)).findByEmail("admin@duoc.cl");
        verify(passwordEncoder, times(1)).matches("password123", "passwordEncriptado");
    }

    @Test
    public void loginPasswordIncorrectoTest() {
        Usuario usuario = new Usuario(1L, "admin", "admin@duoc.cl", "12345678-9", "passwordEncriptado", 
                                    "super_admin", "activo", LocalDateTime.now(), null, null, null, null, null, null);
        
        when(repository.findByEmail("admin@duoc.cl")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("passwordIncorrecto", "passwordEncriptado")).thenReturn(false);

        Exception exception = assertThrows(RuntimeException.class, () -> {
            service.login("admin@duoc.cl", "passwordIncorrecto");
        });

        assertEquals("Credenciales inválidas.", exception.getMessage());
    }

    @Test
    public void loginUsuarioInactivoTest() {
        Usuario usuario = new Usuario(1L, "admin", "admin@duoc.cl", "12345678-9", "passwordEncriptado", 
                                    "super_admin", "inactivo", LocalDateTime.now(), null, null, null, null, null, null);
        
        when(repository.findByEmail("admin@duoc.cl")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("password123", "passwordEncriptado")).thenReturn(true);

        Exception exception = assertThrows(RuntimeException.class, () -> {
            service.login("admin@duoc.cl", "password123");
        });

        assertEquals("Usuario inactivo.", exception.getMessage());
    }
}