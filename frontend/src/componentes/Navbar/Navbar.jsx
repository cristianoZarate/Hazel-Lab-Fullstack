import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getItemsCarritoPorUsuario } from "../../services/api";
import "./Navbar.css";

export function Navbar() {
  const [usuario, setUsuario] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [mostrarMiniCarrito, setMostrarMiniCarrito] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔹 Cargar usuario y carrito - MEJORADO
  useEffect(() => {
    const cargarUsuarioYCarrito = () => {
      const storedUser = JSON.parse(localStorage.getItem("usuarioLogueado"));
      setUsuario(storedUser || null);

      if (storedUser && storedUser.id) {
        cargarCarritoDesdeBackend(storedUser.id);
      } else {
        setCartItems([]);
      }
    };

    cargarUsuarioYCarrito();

    // 🔹 Escuchar eventos de actualización
    const handleCarritoActualizado = () => {
      const storedUser = JSON.parse(localStorage.getItem("usuarioLogueado"));
      if (storedUser && storedUser.id) {
        cargarCarritoDesdeBackend(storedUser.id);
      }
    };

    const handleUsuarioLogueado = () => {
      cargarUsuarioYCarrito();
    };

    window.addEventListener('carritoActualizado', handleCarritoActualizado);
    window.addEventListener('usuarioLogueado', handleUsuarioLogueado);
    
    return () => {
      window.removeEventListener('carritoActualizado', handleCarritoActualizado);
      window.removeEventListener('usuarioLogueado', handleUsuarioLogueado);
    };
  }, []);

  // 🔹 Función para cargar carrito desde backend
  const cargarCarritoDesdeBackend = async (usuarioId) => {
    try {
      setLoading(true);
      const res = await getItemsCarritoPorUsuario(usuarioId);
      setCartItems(res.data || []);
    } catch (error) {
      console.error("Error al cargar carrito:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Cerrar sesión - MEJORADO
  const handleLogout = () => {
    localStorage.removeItem("usuarioLogueado");
    setUsuario(null);
    setCartItems([]);
    
    // 🔹 Disparar eventos para sincronizar otros componentes
    window.dispatchEvent(new Event('carritoActualizado'));
    window.dispatchEvent(new Event('usuarioLogueado'));
    
    alert("Sesión cerrada correctamente.");
    navigate("/");
  };

  // 🔹 Detectar si el usuario es admin o super_admin
  const esAdmin = usuario && ["administrador", "super_admin"].includes(
    usuario.role?.toLowerCase()
  );

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="navbar navbar-expand-lg navbar-light">
      <div className="container d-flex justify-content-between align-items-center">
        {/* ===== Logo ===== */}
        <Link className="navbar-brand fw-bold" to="/">
          Hazel🌰Lab
        </Link>

        {/* ===== Botón colapsable (móvil) ===== */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#menuNav"
          aria-controls="menuNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* ===== Links ===== */}
        <div className="collapse navbar-collapse justify-content-center" id="menuNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/productos">Productos</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/blogs">Blogs</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/nosotros">Nosotros</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contacto">Contacto</Link>
            </li>

            {/* 👇 Solo visible si el usuario es admin o super_admin */}
            {esAdmin && (
              <li className="nav-item">
                <Link className="nav-link fw-bold text-warning" to="/admin">
                  ⚙️ Dashboard Admin
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* ===== Carrito ===== */}
        {/* ✅ VISIBLE PARA TODOS LOS USUARIOS LOGUEADOS, INCLUYENDO ADMINS */}
        {usuario && (
          <div className="carrito-container ms-auto position-relative">
            <button
              className="btn btn-outline-light position-relative"
              onClick={() => setMostrarMiniCarrito(!mostrarMiniCarrito)}
              disabled={loading}
            >
              🛒
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartCount}
                </span>
              )}
            </button>

            {mostrarMiniCarrito && (
              <div
                className="mini-carrito position-absolute end-0 mt-2 p-3 rounded shadow"
                style={{
                  width: "280px",
                  backgroundColor: "#FAF7E6",
                  color: "#333",
                  maxHeight: "260px",
                  overflowY: "auto",
                  zIndex: 1000
                }}
              >
                <h6 className="mb-2 fw-semibold">
                  Tu carrito {esAdmin && <span className="badge bg-warning text-dark">Admin</span>}
                </h6>
                <div className="mini-carrito-list">
                  {loading ? (
                    <p className="text-muted small">Cargando...</p>
                  ) : cartItems.length === 0 ? (
                    <p className="text-muted small">El carrito está vacío.</p>
                  ) : (
                    cartItems.map((item) => (
                      <div key={item.id} className="d-flex justify-content-between small mb-2">
                        <span className="text-truncate" style={{ maxWidth: "150px" }}>
                          {item.producto?.name || "Producto"}
                        </span>
                        <span>x{item.quantity}</span>
                      </div>
                    ))
                  )}
                </div>
                {cartItems.length > 0 && (
                  <Link 
                    to="/carrito" 
                    className="btn btn-sm btn-success w-100 mt-2"
                    onClick={() => setMostrarMiniCarrito(false)}
                  >
                    Ver carrito completo →
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===== Login / Logout ===== */}
        <div className="ms-3">
          {usuario ? (
            <button
              className={`btn btn-sm ${
                esAdmin ? "btn-warning text-dark fw-semibold" : "btn-outline-light"
              }`}
              onClick={handleLogout}
            >
              Cerrar sesión ({usuario.username})
              {esAdmin && " 👑"}
            </button>
          ) : (
            <Link to="/login" className="btn btn-outline-light btn-sm">
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}