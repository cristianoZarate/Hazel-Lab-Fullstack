package com.carrie.hazellabev2.controllers;

import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.carrie.hazellabev2.entities.Usuario;
import com.carrie.hazellabev2.services.UsuarioService;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
public class UsuarioRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UsuarioService usuarioService;

    private List<Usuario> usuariosLista;

    @Test
    public void listarUsuariosTest() throws Exception {
        // Configurar datos de prueba - ACTUALIZADO con todos los nuevos campos
        Usuario usuario1 = new Usuario(
            1L, "admin", "admin@duoc.cl", "12345678-9", "password123", 
            "super_admin", "activo", LocalDateTime.now(),
            "Metropolitana", "Santiago", "Administrador", "1985-05-15", "Av. Siempre Viva 123", null
        );
        
        Usuario usuario2 = new Usuario(
            2L, "vendedor1", "vendedor1@duoc.cl", "98765432-1", "password456", 
            "vendedor", "activo", LocalDateTime.now(),
            "Valparaíso", "Viña del Mar", "Vendedor Principal", "1990-08-20", "Calle 456", null
        );
        
        usuariosLista = Arrays.asList(usuario1, usuario2);

        // Configurar mock del servicio
        when(usuarioService.listarTodo()).thenReturn(usuariosLista);

        // Ejecutar petición y verificar resultado
        mockMvc.perform(get("/api/usuarios")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    public void obtenerUsuarioPorIdTest() {
        // Configurar usuario de prueba - ACTUALIZADO con todos los nuevos campos
        Usuario usuario = new Usuario(
            1L, "admin", "admin@duoc.cl", "12345678-9", "password123", 
            "super_admin", "activo", LocalDateTime.now(),
            "Metropolitana", "Santiago", "Administrador", "1985-05-15", "Av. Siempre Viva 123", null
        );

        try {
            // Configurar mock del servicio
            when(usuarioService.obtenerPorID(1L)).thenReturn(usuario);

            // Ejecutar petición y verificar resultado
            mockMvc.perform(get("/api/usuarios/1")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());
        } catch (Exception ex) {
            fail("El testing lanzó un error: " + ex.getMessage());
        }
    }

    @Test
    public void usuarioNoExisteTest() throws Exception {
        // Configurar mock del servicio para retornar excepción
        when(usuarioService.obtenerPorID(99L))
                .thenThrow(new RuntimeException("Usuario no encontrado."));

        // Ejecutar petición y verificar que retorna error
        mockMvc.perform(get("/api/usuarios/99")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().is5xxServerError());
    }

    @Test
    public void crearUsuarioTest() throws Exception {
        // Configurar usuario nuevo (sin ID) - ACTUALIZADO con todos los nuevos campos
        Usuario usuarioNuevo = new Usuario(
            null, "nuevoUsuario", "nuevo@duoc.cl", "12345678-9", "password123", 
            "vendedor", "activo", null,
            "Metropolitana", "Santiago", "Nuevo Apellido", "1995-12-25", "Av. Nueva 789", null
        );
        
        // Configurar usuario guardado (con ID) - ACTUALIZADO con todos los nuevos campos
        Usuario usuarioGuardado = new Usuario(
            3L, "nuevoUsuario", "nuevo@duoc.cl", "12345678-9", "passwordEncriptado", 
            "vendedor", "activo", LocalDateTime.now(),
            "Metropolitana", "Santiago", "Nuevo Apellido", "1995-12-25", "Av. Nueva 789", null
        );

        // Configurar mock del servicio
        when(usuarioService.crear(any(Usuario.class))).thenReturn(usuarioGuardado);

        // Ejecutar petición POST y verificar resultado
        mockMvc.perform(post("/api/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(usuarioNuevo)))
                .andExpect(status().isOk());
    }

    @Test
    public void crearUsuarioSinRutTest() throws Exception {
        // Nuevo test: validar creación sin RUT
        Usuario usuarioSinRut = new Usuario(
            null, "nuevoUsuario", "nuevo@duoc.cl", null, "password123", 
            "vendedor", "activo", null, null, null, null, null, null, null
        );

        // Configurar mock del servicio para lanzar excepción
        when(usuarioService.crear(any(Usuario.class)))
                .thenThrow(new RuntimeException("El RUT es obligatorio"));

        // Ejecutar petición POST y verificar error
        mockMvc.perform(post("/api/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(usuarioSinRut)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void crearUsuarioEmailInvalidoTest() throws Exception {
        // NUEVO TEST: validar creación con email inválido
        Usuario usuarioEmailInvalido = new Usuario(
            null, "nuevoUsuario", "nuevo@yahoo.com", "12345678-9", "password123", 
            "vendedor", "activo", null, null, null, null, null, null, null
        );

        // Configurar mock del servicio para lanzar excepción
        when(usuarioService.crear(any(Usuario.class)))
                .thenThrow(new RuntimeException("El correo debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com"));

        // Ejecutar petición POST y verificar error
        mockMvc.perform(post("/api/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(usuarioEmailInvalido)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void crearUsuarioSinPasswordTest() throws Exception {
        // NUEVO TEST: validar creación sin password
        Usuario usuarioSinPassword = new Usuario(
            null, "nuevoUsuario", "nuevo@duoc.cl", "12345678-9", null, 
            "vendedor", "activo", null, null, null, null, null, null, null
        );

        // Configurar mock del servicio para lanzar excepción
        when(usuarioService.crear(any(Usuario.class)))
                .thenThrow(new RuntimeException("La contraseña no puede ser nula o vacía"));

        // Ejecutar petición POST y verificar error
        mockMvc.perform(post("/api/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(usuarioSinPassword)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void eliminarUsuarioTest() throws Exception {
        // Configurar mock del servicio - no lanza excepción cuando existe
        when(usuarioService.obtenerPorID(1L))
                .thenReturn(new Usuario(
                    1L, "admin", "admin@duoc.cl", "12345678-9", "password123", 
                    "super_admin", "activo", LocalDateTime.now(),
                    "Metropolitana", "Santiago", "Admin", "1985-01-01", "Dirección 123", null
                ));

        // Ejecutar petición DELETE y verificar resultado
        mockMvc.perform(delete("/api/usuarios/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());
    }

    @Test
    public void eliminarUsuarioNoExisteTest() throws Exception {
        doThrow(new RuntimeException("Usuario no encontrado."))
                .when(usuarioService).eliminar(99L);

        mockMvc.perform(delete("/api/usuarios/99")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());
    }

    @Test
    public void actualizarUsuarioExistenteTest() throws Exception {
        Long id = 1L;

        // Configurar usuario existente - ACTUALIZADO con todos los nuevos campos
        Usuario usuarioExistente = new Usuario(
            id, "admin", "admin@duoc.cl", "12345678-9", "password123", 
            "super_admin", "activo", LocalDateTime.now(),
            "Metropolitana", "Santiago", "Administrador Original", "1985-05-15", "Av. Original 123", null
        );
        
        // Configurar usuario actualizado - ACTUALIZADO con todos los nuevos campos
        Usuario usuarioActualizado = new Usuario(
            id, "adminActualizado", "admin@duoc.cl", "12345678-9", "nuevaPassword", 
            "super_admin", "activo", LocalDateTime.now(),
            "Valparaíso", "Viña del Mar", "Administrador Actualizado", "1985-05-15", "Av. Actualizada 456", null
        );

        // Configurar mocks del servicio
        when(usuarioService.obtenerPorID(id)).thenReturn(usuarioExistente);
        when(usuarioService.actualizar(eq(id), any(Usuario.class)))
                .thenReturn(usuarioActualizado);

        // Ejecutar petición PUT y verificar resultado
        mockMvc.perform(put("/api/usuarios/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(usuarioActualizado)))
                .andExpect(status().isOk());
    }

    @Test
    public void actualizarUsuarioNoExisteTest() throws Exception {
        Long id = 99L;
        // ACTUALIZADO con todos los nuevos campos
        Usuario usuario = new Usuario(
            id, "noExiste", "noexiste@duoc.cl", "12345678-9", "password123", 
            "vendedor", "activo", LocalDateTime.now(),
            "Metropolitana", "Santiago", "No Existe", "1990-01-01", "Dirección 999", null
        );

        when(usuarioService.actualizar(eq(id), any(Usuario.class)))
                .thenThrow(new RuntimeException("Usuario no encontrado."));

        mockMvc.perform(put("/api/usuarios/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(usuario)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    public void actualizarUsuarioEmailInvalidoTest() throws Exception {
        Long id = 1L;
        
        // Configurar usuario existente
        Usuario usuarioExistente = new Usuario(
            id, "admin", "admin@duoc.cl", "12345678-9", "password123", 
            "super_admin", "activo", LocalDateTime.now(), null, null, null, null, null, null
        );
        
        // Configurar usuario actualizado con email inválido
        Usuario usuarioActualizado = new Usuario(
            id, "adminActualizado", "admin@yahoo.com", "12345678-9", "nuevaPassword", 
            "super_admin", "activo", LocalDateTime.now(), null, null, null, null, null, null
        );

        // Configurar mocks del servicio
        when(usuarioService.obtenerPorID(id)).thenReturn(usuarioExistente);
        when(usuarioService.actualizar(eq(id), any(Usuario.class)))
                .thenThrow(new RuntimeException("El correo debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com"));

        // Ejecutar petición PUT y verificar error
        mockMvc.perform(put("/api/usuarios/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(usuarioActualizado)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void crearUsuarioConEmailGmailValidoTest() throws Exception {
        // NUEVO TEST: validar creación con email gmail válido
        Usuario usuarioGmail = new Usuario(
            null, "usuarioGmail", "usuario@gmail.com", "12345678-9", "password123", 
            "cliente", "activo", null,
            "Metropolitana", "Santiago", "Usuario Gmail", "1990-01-01", "Calle Gmail 123", null
        );
        
        Usuario usuarioGuardado = new Usuario(
            4L, "usuarioGmail", "usuario@gmail.com", "12345678-9", "passwordEncriptado", 
            "cliente", "activo", LocalDateTime.now(),
            "Metropolitana", "Santiago", "Usuario Gmail", "1990-01-01", "Calle Gmail 123", null
        );

        // Configurar mock del servicio
        when(usuarioService.crear(any(Usuario.class))).thenReturn(usuarioGuardado);

        // Ejecutar petición POST y verificar resultado
        mockMvc.perform(post("/api/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(usuarioGmail)))
                .andExpect(status().isOk());
    }

    @Test
    public void crearUsuarioConEmailProfesorValidoTest() throws Exception {
        // NUEVO TEST: validar creación con email profesor válido
        Usuario usuarioProfesor = new Usuario(
            null, "profesor", "profesor@profesor.duoc.cl", "12345678-9", "password123", 
            "administrador", "activo", null,
            "Metropolitana", "Santiago", "Profesor Duoc", "1980-01-01", "Av. Profesor 456", null
        );
        
        Usuario usuarioGuardado = new Usuario(
            5L, "profesor", "profesor@profesor.duoc.cl", "12345678-9", "passwordEncriptado", 
            "administrador", "activo", LocalDateTime.now(),
            "Metropolitana", "Santiago", "Profesor Duoc", "1980-01-01", "Av. Profesor 456", null
        );

        // Configurar mock del servicio
        when(usuarioService.crear(any(Usuario.class))).thenReturn(usuarioGuardado);

        // Ejecutar petición POST y verificar resultado
        mockMvc.perform(post("/api/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(usuarioProfesor)))
                .andExpect(status().isOk());
    }

    @Test
    public void actualizarUsuarioConNuevosCamposTest() throws Exception {
        Long id = 2L;

        // Configurar usuario existente
        Usuario usuarioExistente = new Usuario(
            id, "vendedor1", "vendedor1@duoc.cl", "98765432-1", "password456", 
            "vendedor", "activo", LocalDateTime.now(),
            "Valparaíso", "Viña del Mar", "Vendedor Original", "1990-08-20", "Calle Original 456", null
        );
        
        // Configurar usuario actualizado con todos los campos nuevos modificados
        Usuario usuarioActualizado = new Usuario(
            id, "vendedorActualizado", "vendedorActualizado@duoc.cl", "98765432-1", "password456", 
            "vendedor", "inactivo", LocalDateTime.now(),
            "Metropolitana", "Santiago", "Vendedor Modificado", "1992-10-15", "Av. Modificada 789", null
        );

        // Configurar mocks del servicio
        when(usuarioService.obtenerPorID(id)).thenReturn(usuarioExistente);
        when(usuarioService.actualizar(eq(id), any(Usuario.class)))
                .thenReturn(usuarioActualizado);

        // Ejecutar petición PUT y verificar resultado
        mockMvc.perform(put("/api/usuarios/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(usuarioActualizado)))
                .andExpect(status().isOk());
    }
}