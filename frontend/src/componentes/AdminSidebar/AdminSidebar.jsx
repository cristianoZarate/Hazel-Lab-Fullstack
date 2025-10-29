import { Link, useLocation, useNavigate } from "react-router-dom";
import "./AdminSidebar.css";

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("usuarioLogueado");
    alert("Sesión cerrada correctamente.");
    navigate("/");
    window.location.reload();
  };

  // 🔹 Función para redirigir al Home
  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <aside id="menu-sidebar" className="admin-sidebar">
      {/* 🔹 Logo clickeable que redirige al Home */}
      <div 
        id="logo" 
        className="text-center fw-bold mb-4"
        onClick={handleLogoClick}
        style={{ cursor: "pointer" }}
        title="Ir al sitio principal"
      >
        Hazel🌰Lab
      </div>

      <nav id="menu">
        <ul className="list-unstyled text-center flex-grow-1">
          <li className="mb-3">
            <Link
              to="/admin"
              className={`text-decoration-none fw-semibold ${
                location.pathname === "/admin" ? "active-link" : ""
              }`}
            >
              📊 Dashboard
            </Link>
          </li>
          <li className="mb-3">
            <Link
              to="/admin/clientes"
              className={`text-decoration-none fw-semibold ${
                location.pathname.startsWith("/admin/clientes") ? "active-link" : ""
              }`}
            >
              👥 Ver Usuarios
            </Link>
          </li>
          <li className="mb-3">
            <Link
              to="/admin/productos"
              className={`text-decoration-none fw-semibold ${
                location.pathname.startsWith("/admin/productos") ? "active-link" : ""
              }`}
            >
              📦 Ver Inventario
            </Link>
          </li>
        </ul>
      </nav>

      <button className="logout-btn mt-auto mb-4" onClick={handleLogout}>
        🚪 Cerrar sesión
      </button>
    </aside>
  );
}