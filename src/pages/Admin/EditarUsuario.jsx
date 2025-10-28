import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getUsuarios, actualizarUsuario, getRegiones, getComunasPorRegion } from "../../services/api";
import "./VistaClienteYProducto.css";

export function EditarUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});
  
  // Estados para gestión de contraseña
  const [mostrarCampoPassword, setMostrarCampoPassword] = useState(false);
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [errorPassword, setErrorPassword] = useState("");

  // ✅ ESTADOS PARA REGIONES Y COMUNAS
  const [regiones, setRegiones] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [cargandoRegiones, setCargandoRegiones] = useState(true);
  const [cargandoComunas, setCargandoComunas] = useState(false);

  // 🔹 Obtener usuario logueado y sus permisos
  const usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado"));
  const esSuperAdmin = usuarioLogueado?.role?.toLowerCase() === "super_admin";

  // ✅ CARGAR REGIONES AL INICIAR
  useEffect(() => {
    const cargarRegiones = async () => {
      try {
        setCargandoRegiones(true);
        console.log("🔄 Cargando regiones desde API...");
        const response = await getRegiones();
        
        if (response.data && Array.isArray(response.data)) {
          console.log(`✅ ${response.data.length} regiones cargadas`);
          setRegiones(response.data);
        } else {
          console.warn("❌ Formato de datos inesperado:", response.data);
          setRegiones([]);
        }
      } catch (error) {
        console.error("❌ Error al cargar regiones:", error);
        // Datos de respaldo en caso de error
        setRegiones([
          "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo",
          "Valparaíso", "Metropolitana", "O'Higgins", "Maule", "Ñuble",
          "Biobío", "Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes"
        ]);
      } finally {
        setCargandoRegiones(false);
      }
    };
    cargarRegiones();
  }, []);

  // ✅ CARGAR COMUNAS CUANDO CAMBIA LA REGIÓN
  useEffect(() => {
    const cargarComunas = async () => {
      if (usuario?.region) {
        setCargandoComunas(true);
        try {
          console.log(`🔄 Cargando comunas para: ${usuario.region}`);
          const response = await getComunasPorRegion(usuario.region);
          
          if (response.data && Array.isArray(response.data)) {
            console.log(`✅ ${response.data.length} comunas cargadas para ${usuario.region}`);
            setComunas(response.data);
          } else {
            console.warn("❌ Formato de comunas inesperado:", response.data);
            setComunas([]);
          }
        } catch (error) {
          console.error(`❌ Error al cargar comunas para ${usuario.region}:`, error);
          setComunas([]);
        } finally {
          setCargandoComunas(false);
        }
      } else {
        setComunas([]);
      }
    };
    
    if (usuario) {
      cargarComunas();
    }
  }, [usuario?.region]);

  // ✅ CARGAR USUARIO
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        setLoading(true);
        console.log(`🔄 Cargando usuario con ID: ${id}`);
        const response = await getUsuarios();
        const encontrado = response.data.find((u) => u.id === parseInt(id));
        
        if (encontrado) {
          console.log("✅ Usuario encontrado:", encontrado);
          setUsuario(encontrado);
        } else {
          console.error("❌ Usuario no encontrado");
          alert("⚠️ Usuario no encontrado.");
          navigate("/admin/clientes");
        }
      } catch (error) {
        console.error("❌ Error al cargar usuario:", error);
        alert("⚠️ Error al obtener el usuario desde el servidor.");
        navigate("/admin/clientes");
      } finally {
        setLoading(false);
      }
    };
    cargarUsuario();
  }, [id, navigate]);

  // 🔹 Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario((prev) => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario escribe
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: "" }));
    }
  };

  // ✅ VALIDACIÓN DE EMAIL MEJORADA
  const validarEmail = (email) => {
    const dominiosPermitidos = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];
    return dominiosPermitidos.some(dominio => email.endsWith(dominio));
  };

  // ✅ VALIDACIÓN DE FECHA DE NACIMIENTO
  const validarFechaNacimiento = (fecha) => {
    if (!fecha) return true; // Opcional
    
    const fechaNac = new Date(fecha);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      return edad - 1 >= 18;
    }
    return edad >= 18;
  };

  // ✅ VALIDACIÓN DE RUT CHILENO MEJORADA
  const validarRUT = (rut) => {
    if (!rut) return false;
    
    // Validar formato básico: 12.345.678-9 o 12345678-9
    const rutLimpio = rut.replace(/[^0-9kK]/g, '');
    if (rutLimpio.length < 8) return false;
    
    // Validar dígito verificador
    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1).toUpperCase();
    
    let suma = 0;
    let multiplo = 2;
    
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo.charAt(i)) * multiplo;
      multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }
    
    const dvEsperado = 11 - (suma % 11);
    const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
    
    return dvCalculado === dv;
  };

  // 🔹 Validar contraseñas
  const validarPassword = () => {
    if (nuevaPassword.length > 0 && nuevaPassword.length < 6) {
      setErrorPassword("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    
    if (nuevaPassword !== confirmarPassword) {
      setErrorPassword("Las contraseñas no coinciden");
      return false;
    }
    
    setErrorPassword("");
    return true;
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!usuario) return false;

    // Validar campos requeridos
    if (!usuario.username?.trim()) nuevosErrores.username = "El nombre de usuario es obligatorio";
    if (!usuario.apellidos?.trim()) nuevosErrores.apellidos = "Los apellidos son obligatorios";
    if (!usuario.email?.trim()) nuevosErrores.email = "El email es obligatorio";
    if (!usuario.rut?.trim()) nuevosErrores.rut = "El RUT es obligatorio";
    if (!usuario.region) nuevosErrores.region = "La región es obligatoria";
    if (!usuario.comuna) nuevosErrores.comuna = "La comuna es obligatoria";
    if (!usuario.direccion?.trim()) nuevosErrores.direccion = "La dirección es obligatoria";
    
    // Validaciones específicas
    if (usuario.email && !validarEmail(usuario.email)) {
      nuevosErrores.email = "El correo debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com";
    }
    
    if (usuario.rut && !validarRUT(usuario.rut)) {
      nuevosErrores.rut = "El formato del RUT no es válido";
    }
    
    if (usuario.fechaNacimiento && !validarFechaNacimiento(usuario.fechaNacimiento)) {
      nuevosErrores.fechaNacimiento = "El usuario debe ser mayor de 18 años";
    }
    
    // Validar contraseña si se está cambiando
    if (mostrarCampoPassword && nuevaPassword) {
      if (nuevaPassword.length < 6) {
        nuevosErrores.password = "La contraseña debe tener al menos 6 caracteres";
      } else if (nuevaPassword !== confirmarPassword) {
        nuevosErrores.password = "Las contraseñas no coinciden";
      }
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // ✅ FUNCIÓN PARA FORMATEAR RUT
  const formatearRUT = (rut) => {
    if (!rut) return rut;
    
    // Remover formato existente
    const rutLimpio = rut.replace(/[^0-9kK]/g, '');
    
    if (rutLimpio.length < 2) return rut;
    
    // Separar número y dígito verificador
    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1).toUpperCase();
    
    // Formatear con puntos y guión
    const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${cuerpoFormateado}-${dv}`;
  };

  const handleRUTChange = (e) => {
    const rutFormateado = formatearRUT(e.target.value);
    setUsuario(prev => ({ ...prev, rut: rutFormateado }));
    
    if (errores.rut) {
      setErrores(prev => ({ ...prev, rut: "" }));
    }
  };

  // 🔹 Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!usuario) return;
    
    // Validar contraseñas si se está cambiando
    if (mostrarCampoPassword && !validarPassword()) {
      return;
    }

    if (!validarFormulario()) {
      alert("⚠️ Por favor corrige los errores en el formulario.");
      return;
    }

    setGuardando(true);
    
    try {
      // Preparar datos para enviar
      const datosActualizados = { ...usuario };
      
      // Si se está cambiando la contraseña, incluirla
      if (mostrarCampoPassword && nuevaPassword) {
        datosActualizados.password = nuevaPassword;
      } else {
        // No incluir el campo password si no se está cambiando
        delete datosActualizados.password;
      }

      console.log("📤 Enviando datos actualizados:", datosActualizados);
      const response = await actualizarUsuario(id, datosActualizados);
      console.log("✅ Usuario actualizado:", response.data);
      
      alert("✅ Usuario actualizado correctamente.");
      navigate("/admin/clientes");
      
    } catch (error) {
      console.error("❌ Error al actualizar usuario:", error);
      
      if (error.response?.status === 400) {
        const mensajeError = error.response.data?.message || error.response.data;
        if (mensajeError.includes("email") || mensajeError.includes("correo")) {
          alert("⚠️ El email ya está en uso. Intenta con otro.");
        } else if (mensajeError.includes("rut") || mensajeError.includes("RUT")) {
          alert("⚠️ El RUT ya está registrado. Intenta con otro.");
        } else {
          alert(`⚠️ ${mensajeError}`);
        }
      } else {
        alert("⚠️ No se pudo actualizar el usuario. Revisa los datos e intenta nuevamente.");
      }
    } finally {
      setGuardando(false);
    }
  };

  // ✅ FUNCIÓN PARA CALCULAR EDAD
  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    
    try {
      const fechaNac = new Date(fechaNacimiento);
      const hoy = new Date();
      const edad = hoy.getFullYear() - fechaNac.getFullYear();
      const mes = hoy.getMonth() - fechaNac.getMonth();
      
      return (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) ? edad - 1 : edad;
    } catch (error) {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando usuario...</span>
        </div>
        <p className="mt-2">Cargando información del usuario...</p>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="alert alert-danger text-center mt-5">
        <h5>❌ Usuario no encontrado</h5>
        <p>El usuario que intentas editar no existe.</p>
        <Link to="/admin/clientes" className="btn btn-primary">
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="vista-clientes-container">
      <header className="clientes-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">✏️ Editar Usuario</h2>
          <small className="text-muted">
            ID: {usuario.id} • Creado: {usuario.createdAt ? new Date(usuario.createdAt).toLocaleDateString('es-CL') : 'N/A'}
          </small>
          {!esSuperAdmin && (
            <div className="mt-1">
              <small className="text-warning">
                🔐 Nota: Solo Super Admin puede cambiar contraseñas
              </small>
            </div>
          )}
        </div>
        <Link to="/admin/clientes" className="btn btn-secondary">
          ← Volver al Listado
        </Link>
      </header>

      <section className="clientes-table-section p-4 shadow-sm rounded bg-white">
        <form onSubmit={handleSubmit} className="row g-3">
          
          {/* ==== INFORMACIÓN BÁSICA ==== */}
          <div className="col-12">
            <h5 className="border-bottom pb-2 mb-4">
              📋 Información Básica
              <small className="text-muted ms-2">(Todos los campos son obligatorios)</small>
            </h5>
          </div>

          {/* ID solo lectura */}
          <div className="col-md-4">
            <label className="form-label fw-semibold">🆔 ID del Usuario</label>
            <input
              type="text"
              className="form-control"
              value={usuario.id}
              disabled
            />
            <div className="form-text">
              Identificador único del usuario
            </div>
          </div>

          {/* Nombre */}
          <div className="col-md-4">
            <label className="form-label fw-semibold">👤 Nombre de usuario *</label>
            <input
              type="text"
              name="username"
              className={`form-control ${errores.username ? 'is-invalid' : ''}`}
              value={usuario.username || ""}
              onChange={handleChange}
              placeholder="Ej: juanperez"
              required
            />
            {errores.username && (
              <div className="invalid-feedback">{errores.username}</div>
            )}
            <div className="form-text">
              Nombre público del usuario
            </div>
          </div>

          {/* Apellidos */}
          <div className="col-md-4">
            <label className="form-label fw-semibold">👥 Apellidos *</label>
            <input
              type="text"
              name="apellidos"
              className={`form-control ${errores.apellidos ? 'is-invalid' : ''}`}
              value={usuario.apellidos || ""}
              onChange={handleChange}
              placeholder="Ej: Pérez González"
              maxLength="100"
              required
            />
            {errores.apellidos && (
              <div className="invalid-feedback">{errores.apellidos}</div>
            )}
            <div className="form-text">
              Máximo 100 caracteres
            </div>
          </div>

          {/* Email */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">📧 Correo electrónico *</label>
            <input
              type="email"
              name="email"
              className={`form-control ${errores.email ? 'is-invalid' : ''}`}
              value={usuario.email || ""}
              onChange={handleChange}
              placeholder="Ej: usuario@duoc.cl"
              required
            />
            {errores.email && (
              <div className="invalid-feedback">{errores.email}</div>
            )}
            <div className="form-text">
              💡 Solo se permiten: @duoc.cl, @profesor.duoc.cl o @gmail.com
            </div>
          </div>

          {/* RUT */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">🆔 RUT *</label>
            <input
              type="text"
              name="rut"
              className={`form-control ${errores.rut ? 'is-invalid' : ''}`}
              value={usuario.rut}
              onChange={handleRUTChange}
              placeholder="Ej: 12.345.678-9"
              required
            />
            {errores.rut && (
              <div className="invalid-feedback">{errores.rut}</div>
            )}
            <div className="form-text">
              💡 Formato chileno con puntos y guión. Se formatea automáticamente.
            </div>
          </div>

          {/* Fecha de Nacimiento */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">
              🎂 Fecha de Nacimiento
              {usuario.fechaNacimiento && (
                <span className="badge bg-info ms-2">
                  {calcularEdad(usuario.fechaNacimiento)} años
                </span>
              )}
            </label>
            <input
              type="date"
              name="fechaNacimiento"
              className={`form-control ${errores.fechaNacimiento ? 'is-invalid' : ''}`}
              value={usuario.fechaNacimiento || ""}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
            />
            {errores.fechaNacimiento && (
              <div className="invalid-feedback">{errores.fechaNacimiento}</div>
            )}
            <div className="form-text">
              💡 Opcional - Debe ser mayor de 18 años
            </div>
          </div>

          {/* Rol */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">🎭 Rol *</label>
            <select
              name="role"
              className="form-select"
              value={usuario.role || ""}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar rol...</option>
              <option value="cliente">👤 Cliente</option>
              <option value="vendedor">💼 Vendedor</option>
              <option value="administrador">🛡️ Administrador</option>
              <option value="super_admin">⭐ Super Admin</option>
            </select>
            <div className="form-text">
              <strong>👤 Cliente:</strong> Solo compras y perfil personal<br/>
              <strong>💼 Vendedor:</strong> Gestionar productos y ver clientes<br/>
              <strong>🛡️ Administrador:</strong> Acceso completo excepto eliminar<br/>
              <strong>⭐ Super Admin:</strong> Acceso total al sistema
            </div>
          </div>

          {/* ==== UBICACIÓN ==== */}
          <div className="col-12 mt-4">
            <h5 className="border-bottom pb-2 mb-4">
              📍 Ubicación
              <small className="text-muted ms-2">(Selecciona región y comuna)</small>
            </h5>
          </div>

          {/* Región */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">🗺️ Región *</label>
            <select
              name="region"
              className={`form-select ${errores.region ? 'is-invalid' : ''}`}
              value={usuario.region || ""}
              onChange={handleChange}
              required
              disabled={cargandoRegiones}
            >
              <option value="">
                {cargandoRegiones ? "🔄 Cargando regiones..." : "Seleccionar región..."}
              </option>
              {regiones.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            {errores.region && (
              <div className="invalid-feedback">{errores.region}</div>
            )}
            {cargandoRegiones && (
              <div className="form-text">🔄 Cargando lista de regiones...</div>
            )}
          </div>

          {/* Comuna */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">🏘️ Comuna *</label>
            <select
              name="comuna"
              className={`form-select ${errores.comuna ? 'is-invalid' : ''}`}
              value={usuario.comuna || ""}
              onChange={handleChange}
              required
              disabled={cargandoComunas || !usuario.region}
            >
              <option value="">
                {cargandoComunas 
                  ? "🔄 Cargando comunas..." 
                  : !usuario.region 
                    ? "Primero selecciona una región" 
                    : "Seleccionar comuna..."
                }
              </option>
              {comunas.map((comuna) => (
                <option key={comuna} value={comuna}>
                  {comuna}
                </option>
              ))}
            </select>
            {errores.comuna && (
              <div className="invalid-feedback">{errores.comuna}</div>
            )}
            {cargandoComunas && (
              <div className="form-text">🔄 Cargando comunas de {usuario.region}...</div>
            )}
            {usuario.region && comunas.length === 0 && !cargandoComunas && (
              <div className="form-text text-warning">
                ⚠️ No se encontraron comunas para esta región
              </div>
            )}
          </div>

          {/* Dirección */}
          <div className="col-12">
            <label className="form-label fw-semibold">🏠 Dirección *</label>
            <input
              type="text"
              name="direccion"
              className={`form-control ${errores.direccion ? 'is-invalid' : ''}`}
              value={usuario.direccion || ""}
              onChange={handleChange}
              placeholder="Ingresa tu dirección completa"
              required
              maxLength="300"
            />
            {errores.direccion && (
              <div className="invalid-feedback">{errores.direccion}</div>
            )}
            <div className="form-text">
              Máximo 300 caracteres. Incluye calle, número, departamento, etc.
            </div>
          </div>

          {/* Estado */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">📊 Estado *</label>
            <select
              name="status"
              className="form-select"
              value={usuario.status || ""}
              onChange={handleChange}
              required
            >
              <option value="activo">✅ Activo (puede acceder al sistema)</option>
              <option value="inactivo">❌ Inactivo (no puede acceder)</option>
            </select>
            <div className="form-text">
              <strong>✅ Activo:</strong> Usuario puede iniciar sesión y usar el sistema<br/>
              <strong>❌ Inactivo:</strong> Usuario no puede acceder al sistema
            </div>
          </div>

          {/* ==== GESTIÓN DE CONTRASEÑA (Solo Super Admin) ==== */}
          {esSuperAdmin && (
            <>
              <div className="col-12 mt-4">
                <h5 className="border-bottom pb-2 mb-3">🔒 Gestión de Contraseña</h5>
                
                {!mostrarCampoPassword ? (
                  <div className="alert alert-info">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="mb-1"><strong>¿Deseas cambiar la contraseña de este usuario?</strong></p>
                        <p className="mb-0 small">La contraseña actual se mantendrá si no realizas cambios.</p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setMostrarCampoPassword(true)}
                      >
                        🔑 Cambiar Contraseña
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="card border-primary">
                    <div className="card-header bg-primary bg-opacity-10">
                      <h6 className="mb-0">🔐 Nueva Contraseña</h6>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Nueva Contraseña</label>
                          <input
                            type="password"
                            className={`form-control ${errores.password ? 'is-invalid' : ''}`}
                            placeholder="Mínimo 6 caracteres"
                            value={nuevaPassword}
                            onChange={(e) => {
                              setNuevaPassword(e.target.value);
                              if (errorPassword) validarPassword();
                            }}
                          />
                          {errores.password && (
                            <div className="invalid-feedback">{errores.password}</div>
                          )}
                        </div>
                        
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Confirmar Contraseña</label>
                          <input
                            type="password"
                            className={`form-control ${errores.password ? 'is-invalid' : ''}`}
                            placeholder="Repite la contraseña"
                            value={confirmarPassword}
                            onChange={(e) => {
                              setConfirmarPassword(e.target.value);
                              if (errorPassword) validarPassword();
                            }}
                          />
                          {errores.password && (
                            <div className="invalid-feedback">{errores.password}</div>
                          )}
                        </div>
                        
                        <div className="col-12">
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => {
                                setMostrarCampoPassword(false);
                                setNuevaPassword("");
                                setConfirmarPassword("");
                                setErrorPassword("");
                                setErrores(prev => ({ ...prev, password: "" }));
                              }}
                            >
                              ✖️ Cancelar Cambio
                            </button>
                            <span className="text-muted small align-self-center">
                              Deja vacío para mantener la contraseña actual
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ==== INFORMACIÓN DEL SISTEMA ==== */}
          <div className="col-12 mt-4">
            <h5 className="border-bottom pb-2 mb-3">⚙️ Información del Sistema</h5>
          </div>

          {/* Fecha creación */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">📅 Fecha de creación</label>
            <input
              type="text"
              className="form-control"
              value={
                usuario.createdAt
                  ? new Date(usuario.createdAt).toLocaleString("es-CL")
                  : "—"
              }
              disabled
            />
            <div className="form-text">
              Fecha de registro en el sistema
            </div>
          </div>

          {/* Items en carrito */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">🛒 Items en Carrito</label>
            <input
              type="text"
              className="form-control"
              value={usuario.itemsCarrito?.length || 0}
              disabled
            />
            <div className="form-text">
              Productos actualmente en el carrito de compras
            </div>
          </div>

          {/* ==== RESUMEN DE CAMBIOS ==== */}
          <div className="col-12 mt-4">
            <div className="card border-warning">
              <div className="card-header bg-warning bg-opacity-10 d-flex justify-content-between align-items-center">
                <h6 className="mb-0">📋 Resumen de Cambios</h6>
                <span className={`badge ${Object.keys(errores).length === 0 ? 'bg-success' : 'bg-warning'}`}>
                  {Object.keys(errores).length === 0 ? '✅ Listo para guardar' : '⚠️ Revisar errores'}
                </span>
              </div>
              <div className="card-body">
                <div className="row small">
                  <div className="col-md-6">
                    <strong>👤 Usuario:</strong> {usuario.username || "—"}<br/>
                    <strong>📧 Email:</strong> {usuario.email || "—"}<br/>
                    <strong>🎭 Rol:</strong> {usuario.role ? usuario.role.charAt(0).toUpperCase() + usuario.role.slice(1) : "—"}<br/>
                    <strong>📊 Estado:</strong> {usuario.status === 'activo' ? '✅ Activo' : '❌ Inactivo'}
                  </div>
                  <div className="col-md-6">
                    <strong>📍 Ubicación:</strong> {usuario.comuna ? `${usuario.comuna}, ${usuario.region}` : "—"}<br/>
                    <strong>🎂 Edad:</strong> {usuario.fechaNacimiento ? `${calcularEdad(usuario.fechaNacimiento)} años` : "—"}<br/>
                    <strong>🔐 Contraseña:</strong> {mostrarCampoPassword && nuevaPassword ? "🔑 Será cambiada" : "🔄 Sin cambios"}
                  </div>
                </div>
                
                {/* Mostrar errores de resumen */}
                {Object.keys(errores).length > 0 && (
                  <div className="mt-3 p-2 bg-warning bg-opacity-10 rounded">
                    <small className="text-warning">
                      <strong>⚠️ Errores a corregir:</strong>
                      <ul className="mb-0 mt-1">
                        {Object.entries(errores).map(([campo, mensaje]) => (
                          <li key={campo}>{mensaje}</li>
                        ))}
                      </ul>
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ==== BOTONES ==== */}
          <div className="col-12 d-flex justify-content-between mt-4 pt-3 border-top">
            <button 
              type="submit" 
              className="btn btn-success px-4"
              disabled={guardando || Object.keys(errores).length > 0}
            >
              {guardando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Guardando Cambios...
                </>
              ) : (
                <>
                  💾 Guardar Cambios
                </>
              )}
            </button>
            
            <div>
              <Link to="/admin/clientes" className="btn btn-outline-secondary me-2">
                ← Cancelar
              </Link>
              <button
                type="button"
                className="btn btn-outline-info"
                onClick={() => window.location.reload()}
                disabled={guardando}
              >
                🔄 Recargar Datos
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}