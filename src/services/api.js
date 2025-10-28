import axios from "axios";

// 🌍 Base URL configurable desde .env o fallback local
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ======================================================
   📦 PRODUCTOS
====================================================== */

// Obtener todos los productos
export const getProductos = () => api.get("/productos");

// Crear un nuevo producto
export const crearProducto = (data) => api.post("/productos", data);

// Actualizar un producto existente
export const actualizarProducto = (id, data) => api.put(`/productos/${id}`, data);

// Eliminar producto por ID
export const eliminarProducto = (id) => api.delete(`/productos/${id}`);

// Obtener productos destacados
export const getProductosDestacados = () => api.get("/productos/destacados");

/* ======================================================
   🏷️ CATEGORÍAS
====================================================== */
export const getCategorias = () => api.get("/categorias");

/* ======================================================
   👤 USUARIOS
====================================================== */

// Obtener todos los usuarios
export const getUsuarios = () => api.get("/usuarios");

// Obtener un usuario por ID
export const getUsuarioPorId = (id) => api.get(`/usuarios/${id}`);

// Crear usuario nuevo
export const crearUsuario = async (usuario) => {
  console.log("📤 Enviando usuario al backend:", usuario);

  // ✅ VALIDACIONES MEJORADAS CON FORMATO RUT
  if (!usuario.rut || usuario.rut.trim() === "") {
    throw new Error("El RUT es obligatorio");
  }

  // ✅ VALIDAR FORMATO DE RUT CHILENO
  if (!usuario.rut.match(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/)) {
    throw new Error("Formato de RUT inválido. Use: 12.345.678-9");
  }

  if (!usuario.email || usuario.email.trim() === "") {
    throw new Error("El correo electrónico es obligatorio");
  }

  // ✅ VALIDAR FORMATO DE EMAIL
  if (!usuario.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    throw new Error("Formato de email inválido");
  }

  if (!usuario.password || usuario.password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres");
  }

  // Asegurar que el backend reciba todos los campos necesarios
  const payload = {
    username: usuario.username || "",
    email: usuario.email,
    rut: usuario.rut, // ✅ nuevo campo requerido
    password: usuario.password,
    role: usuario.role || "Cliente",
    status: usuario.status || "activo",
  };

  console.log("🚀 Payload final enviado:", payload);
  return api.post("/usuarios", payload);
};

// Actualizar usuario existente
export const actualizarUsuario = async (id, data) => {
  const payload = { ...data };

  // ✅ VALIDACIONES MEJORADAS PARA ACTUALIZACIÓN
  if (!payload.rut || payload.rut.trim() === "") {
    throw new Error("El RUT es obligatorio");
  }

  // ✅ VALIDAR FORMATO DE RUT EN ACTUALIZACIÓN
  if (!payload.rut.match(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/)) {
    throw new Error("Formato de RUT inválido. Use: 12.345.678-9");
  }

  // ✅ VALIDAR EMAIL EN ACTUALIZACIÓN
  if (payload.email && !payload.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    throw new Error("Formato de email inválido");
  }

  if (payload.password) {
    if (payload.password.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }
    console.log("🔐 Enviando nueva contraseña para encriptar");
  } else {
    delete payload.password;
  }

  console.log(`🛠️ Actualizando usuario ${id}:`, payload);
  return api.put(`/usuarios/${id}`, payload);
};

// Eliminar usuario
export const eliminarUsuario = (id) => api.delete(`/usuarios/${id}`);

/* ======================================================
   🔐 AUTENTICACIÓN
====================================================== */

// Login de usuario - usa el endpoint correcto
export const loginUsuario = (email, password) =>
  api.post("/auth/login", { email, password });

/* ======================================================
   🛒 CARRITO DE COMPRAS
====================================================== */

// Agregar ítem al carrito
export const agregarItemCarrito = (usuarioId, productoId, quantity = 1) =>
  api.post("/itemscarrito", {
    usuario: { id: usuarioId },
    producto: { id: productoId },
    quantity,
  });

// Obtener ítems del carrito por usuario
export const getItemsCarritoPorUsuario = (usuarioId) =>
  api.get(`/itemscarrito/usuario/${usuarioId}`);

// Actualizar cantidad de ítem del carrito
export const actualizarItemCarrito = (itemId, nuevaCantidad) =>
  api.put(`/itemscarrito/${itemId}/cantidad`, { quantity: nuevaCantidad });

// Eliminar ítem del carrito
export const eliminarItemCarrito = (itemId) => api.delete(`/itemscarrito/${itemId}`);

/* ======================================================
   🖼️ GESTIÓN DE IMÁGENES - CLOUDINARY
====================================================== */

// 🔹 CONFIGURACIÓN CLOUDINARY
const CLOUDINARY_CLOUD_NAME = "dyjktrr3a"; // ← Reemplazar si es necesario
const CLOUDINARY_UPLOAD_PRESET = "hazellab"; // ← El que creaste

// Subir imagen a Cloudinary
export const subirImagen = async (archivo) => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("❌ Cloudinary no está configurado correctamente");
  }

  if (!archivo || !archivo.type.startsWith("image/")) {
    throw new Error("❌ Archivo no válido. Debe ser una imagen");
  }

  const formData = new FormData();
  formData.append("file", archivo);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", "hazellab/products");

  try {
    console.log("📤 Subiendo imagen a Cloudinary...", {
      cloudName: CLOUDINARY_CLOUD_NAME,
      preset: CLOUDINARY_UPLOAD_PRESET,
      file: { name: archivo.name, type: archivo.type, size: archivo.size },
    });

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Error de Cloudinary:", data);
      throw new Error(data.error?.message || `Error ${response.status}: ${response.statusText}`);
    }

    console.log("✅ Imagen subida exitosamente:", data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error("❌ Error completo al subir imagen:", error);
    throw new Error(`No se pudo subir la imagen: ${error.message}`);
  }
};

// 🔹 Función para probar la conexión con Cloudinary
export const probarConexionCloudinary = async () => {
  const archivoDePrueba = new File(["test"], "test.png", { type: "image/png" });

  try {
    const url = await subirImagen(archivoDePrueba);
    return { success: true, url };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 🔹 Función auxiliar para validar RUT (puede ser usada en otros componentes)
export const validarRUT = (rut) => {
  if (!rut) return false;
  
  // Validar formato básico
  const formatoValido = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/.test(rut);
  if (!formatoValido) return false;
  
  // Aquí podrías agregar validación del dígito verificador si lo necesitas
  return true;
};

// 🔹 Función auxiliar para formatear RUT
export const formatearRUT = (rut) => {
  if (!rut) return '';
  
  // Remover cualquier formato existente
  let rutLimpio = rut.replace(/[^0-9kK]/g, '');
  
  if (rutLimpio.length < 2) return rut;
  
  // Separar número y dígito verificador
  const numero = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1).toUpperCase();
  
  // Formatear con puntos y guión
  return numero.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
};

// ✅ NUEVAS FUNCIONES PARA REGIONES Y COMUNAS
export const getRegiones = async () => {
  try {
    const response = await api.get('/ubicacion/regiones');
    return response;
  } catch (error) {
    console.error('Error al obtener regiones:', error);
    // Retornar datos por defecto en caso de error
    return { data: [
      "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo",
      "Valparaíso", "Metropolitana", "O'Higgins", "Maule", "Ñuble",
      "Biobío", "Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes"
    ] };
  }
};

export const getComunasPorRegion = async (region) => {
  try {
    const response = await api.get(`/ubicacion/comunas/${encodeURIComponent(region)}`);
    return response;
  } catch (error) {
    console.error(`Error al obtener comunas para ${region}:`, error);
    // Retornar array vacío en caso de error
    return { data: [] };
  }
};

export const getRegionesComunas = () => {
  return api.get('/api/ubicacion/regiones-comunas');
};







// 📊 ESTADÍSTICAS DEL DASHBOARD
export const getEstadisticasDashboard = () => {
  return api.get('/api/dashboard/estadisticas');
};

// 🔍 FILTROS AVANZADOS DE PRODUCTOS
export const buscarProductosAvanzado = (filtros) => {
  const params = new URLSearchParams();
  
  if (filtros.nombre) params.append('nombre', filtros.nombre);
  if (filtros.categoriaId) params.append('categoriaId', filtros.categoriaId);
  if (filtros.activo !== undefined) params.append('activo', filtros.activo);
  if (filtros.stockBajo) params.append('stockBajo', true);
  if (filtros.destacado !== undefined) params.append('destacado', filtros.destacado);
  if (filtros.precioMin) params.append('precioMin', filtros.precioMin);
  if (filtros.precioMax) params.append('precioMax', filtros.precioMax);
  
  return api.get(`/api/productos/buscar/avanzada?${params.toString()}`);
};

// 👥 FILTROS AVANZADOS DE USUARIOS
export const buscarUsuariosAvanzado = (filtros) => {
  const params = new URLSearchParams();
  
  if (filtros.username) params.append('username', filtros.username);
  if (filtros.email) params.append('email', filtros.email);
  if (filtros.rol) params.append('rol', filtros.rol);
  if (filtros.estado) params.append('estado', filtros.estado);
  if (filtros.region) params.append('region', filtros.region);
  
  return api.get(`/api/usuarios/buscar/avanzada?${params.toString()}`);
};

// 📈 PRODUCTOS MÁS VENDIDOS
export const getProductosMasVendidos = () => {
  return api.get('/api/dashboard/productos-mas-vendidos');
};

