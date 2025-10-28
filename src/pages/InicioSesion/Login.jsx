import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUsuario } from "../../services/api";
import "./Login-y-registro.css";

export function Login() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Validación de correos permitidos
  const validarCorreo = (correo) => {
    const regex = /^[a-zA-Z0-9._%+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/;
    return regex.test(correo);
  };

  // ✅ Validación del formulario
  const validarFormulario = () => {
    if (!correo.trim()) {
      setError("El correo electrónico es obligatorio");
      return false;
    }
    if (!validarCorreo(correo)) {
      setError("Correo inválido. Solo se permiten @duoc.cl, @profesor.duoc.cl o @gmail.com");
      return false;
    }
    if (!clave.trim()) {
      setError("La contraseña es obligatoria");
      return false;
    }
    if (clave.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres");
      return false;
    }
    setError("");
    return true;
  };

  // ✅ Manejo del envío del formulario - MEJORADO
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    const email = correo.trim().toLowerCase();
    const password = clave.trim();

    try {
      setLoading(true);
      setError("");
      
      const response = await loginUsuario(email, password);
      const usuario = response.data;

      // ✅ Validación más robusta del usuario
      if (!usuario || !usuario.id || !usuario.email) {
        setError("Error: respuesta inválida del servidor.");
        return;
      }

      // ✅ Guardar sesión local coherente con Navbar
      localStorage.setItem("usuarioLogueado", JSON.stringify(usuario));

      // ✅ Disparar evento para actualizar componentes
      window.dispatchEvent(new Event('usuarioLogueado'));
      
      alert(`¡Bienvenido ${usuario.username || "Usuario"}!`);

      // ✅ Redirección según rol con verificación mejorada
      const rol = usuario.role?.toLowerCase() || "cliente";

      if (["administrador", "super_admin"].includes(rol)) {
        navigate("/admin");
      } else {
        navigate("/");
      }
      
    } catch (error) {
      console.error("Error completo al iniciar sesión:", error);
      
      // ✅ Manejo de errores más específico
      if (error.response?.status === 401) {
        setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
      } else if (error.response?.status === 404) {
        setError("Usuario no encontrado en el sistema.");
      } else if (error.response?.status === 403) {
        setError("Usuario inactivo. Contacta al administrador.");
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.code === "NETWORK_ERROR") {
        setError("Error de conexión. Verifica tu internet.");
      } else {
        setError("Error al iniciar sesión. Intenta nuevamente.");
      }
      
      setClave("");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Render
  return (
    <main className="container my-5">
      <div className="login-container">
        <h2 className="login-title">Iniciar Sesión</h2>

        {/* Mostrar errores */}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="correo">Correo electrónico</label>
          <input
            type="email"
            id="correo"
            name="correo"
            required
            maxLength="100"
            placeholder="admin@duoc.cl"
            value={correo}
            onChange={(e) => {
              setCorreo(e.target.value);
              setError(""); // Limpiar error al escribir
            }}
            disabled={loading}
          />

          <label htmlFor="clave">Contraseña</label>
          <input
            type="password"
            id="clave"
            name="clave"
            required
            minLength="4"
            maxLength="60"
            placeholder="Contraseña"
            value={clave}
            onChange={(e) => {
              setClave(e.target.value);
              setError(""); // Limpiar error al escribir
            }}
            disabled={loading}
          />

          <button 
            type="submit" 
            className="login-btn mt-3" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Iniciando sesión...
              </>
            ) : (
              "Ingresar"
            )}
          </button>

          <div className="text-center mt-3">
            <Link to="/registro" className="login-link">
              ¿No tienes cuenta? Regístrate
            </Link>
          </div>

          <div className="text-center mt-3">
            <Link to="/" className="login-link">
              ← Volver al Home
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}