// src/pages/Productos/Productos.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProductos, getCategorias, agregarItemCarrito } from "../../services/api";
import "../../index.css";

export function Productos() {
  const PLACEHOLDER_IMG = "/wooden.jpg";
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [agregando, setAgregando] = useState(null);
  const [imagenesCargadas, setImagenesCargadas] = useState({});

  const fmt = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  });

  useEffect(() => {
    getProductos()
      .then((res) => setProductos(res.data))
      .catch((err) => {
        console.error("Error al obtener productos:", err);
        setError("No se pudieron cargar los productos desde el servidor.");
      });
  }, []);

  useEffect(() => {
    getCategorias()
      .then((res) => setCategorias(res.data))
      .catch((err) => console.error("Error al obtener categorías:", err));
  }, []);

  async function agregarAlCarrito(productoId, productoNombre) {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));

    if (!usuario) {
      alert("Debes iniciar sesión para agregar productos al carrito.");
      return;
    }

    setAgregando(productoId);

    try {
      await agregarItemCarrito(usuario.id, productoId, 1);
      window.dispatchEvent(new Event('carritoActualizado'));
      alert(`"${productoNombre}" agregado al carrito`);
    } catch (error) {
      console.error("Error al agregar producto al carrito:", error);
      if (error.response?.status === 401) {
        alert("Sesión expirada. Por favor, inicia sesión nuevamente.");
      } else if (error.response?.status === 404) {
        alert("Producto no encontrado.");
      } else {
        alert("No se pudo agregar el producto al carrito.");
      }
    } finally {
      setAgregando(null);
    }
  }

  const manejarErrorImagen = (productoId) => {
    setImagenesCargadas(prev => ({
      ...prev,
      [productoId]: true
    }));
  };

  const filtrados = productos.filter((p) => {
    const coincideCategoria =
      filtro === "todas" ||
      (p.category && String(p.category.id) === String(filtro));

    const coincideBusqueda =
      p.name.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.description &&
        p.description.toLowerCase().includes(busqueda.toLowerCase()));

    return coincideCategoria && coincideBusqueda;
  });

  return (
    <main className="container my-5">
      <h1 className="mb-4">Productos</h1>
      {error && <p className="text-danger">{error}</p>}

      <div className="mb-3">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="form-control"
          style={{ maxWidth: "400px", display: "inline-block", marginRight: "10px" }}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="productos-filtro" className="me-2">
          Filtrar por categoría:
        </label>
        <select
          id="productos-filtro"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="form-select"
          style={{ maxWidth: "250px", display: "inline-block" }}
        >
          <option value="todas">Todas</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="home-products-grid">
        {filtrados.length === 0 ? (
          <p>No hay productos que coincidan con tu búsqueda.</p>
        ) : (
          filtrados.map((p) => {
            const mostrarPlaceholder = !p.image || imagenesCargadas[p.id];
            const imagenSrc = mostrarPlaceholder ? PLACEHOLDER_IMG : p.image;

            return (
              <article key={p.id} className="home-product-card">
                <img
                  src={imagenSrc}
                  alt={p.name || "producto"}
                  className="home-product-image"
                  onError={() => manejarErrorImagen(p.id)}
                />
                <h3 className="home-product-name">{p.name || "Sin nombre"}</h3>
                <p className="home-product-description">
                  {p.description
                    ? p.description.substring(0, 120) +
                      (p.description.length > 120 ? "…" : "")
                    : "Sin descripción disponible"}
                </p>
                <p className="home-product-price">{fmt.format(p.cost || 0)}</p>

                <button
                  type="button"
                  className="home-product-button"
                  onClick={() => agregarAlCarrito(p.id, p.name)}
                  disabled={agregando === p.id}
                  style={{
                    opacity: agregando === p.id ? 0.6 : 1,
                    cursor: agregando === p.id ? 'not-allowed' : 'pointer'
                  }}
                >
                  {agregando === p.id ? "Agregando..." : "Agregar al carrito"}
                </button>

                <Link
                  to={`/detalle-producto/${p.id}`}
                  className="btn btn-link mt-2"
                  style={{ display: "block", color: "#587042" }}
                >
                  Ver detalle
                </Link>
              </article>
            );
          })
        )}
      </div>
    </main>
  );
}