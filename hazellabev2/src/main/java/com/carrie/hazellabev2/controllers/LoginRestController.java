package com.carrie.hazellabev2.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.carrie.hazellabev2.dto.LoginRequest;
import com.carrie.hazellabev2.entities.Usuario;
import com.carrie.hazellabev2.services.UsuarioService;

// ✅ NUEVAS IMPORTACIONES SWAGGER
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticación", description = "Operaciones de login y autenticación de usuarios") // ✅ NUEVO
public class LoginRestController {
    
    @Autowired
    private UsuarioService usuarioService;

    @Operation(summary = "Iniciar sesión", description = "Autentica un usuario con email y contraseña")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login exitoso",
                     content = @Content(mediaType = "application/json", 
                     schema = @Schema(implementation = Usuario.class))),
        @ApiResponse(responseCode = "400", description = "Credenciales inválidas o usuario inactivo"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            Usuario usuario = usuarioService.login(loginRequest.getEmail(), loginRequest.getPassword());
            
            // ✅ Validar que sea admin para dashboard (requerimiento rúbrica)
            if (!usuario.getRole().equals("super_admin") && !usuario.getRole().equals("admin")) {
                return ResponseEntity.badRequest().body("Acceso solo para administradores");
            }
            
            usuario.setPassword(null);
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}