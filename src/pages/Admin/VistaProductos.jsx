import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProductos, eliminarProducto, buscarProductosAvanzado } from "../../services/api";
import { FiltrosAvanzados } from "./FiltrosAvanzados";
import "./VistaClienteYProducto.css";

export function VistaProductos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eliminando, setEliminando] = useState(null);

  // 🔹 Estados para búsqueda y filtrado
  const [busqueda, setBusqueda] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("todos");
  const [filtroStock, setFiltroStock] = useState("todos");
  const [filtrosAvanzados, setFiltrosAvanzados] = useState({});

  // 🔹 Paginación local
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 10;

  // 🔹 Obtener usuario logueado
  const usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado"));
  const esSuperAdmin = usuarioLogueado?.role?.toLowerCase() === "super_admin";
  const esVendedor = usuarioLogueado?.role?.toLowerCase() === "vendedor";

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        console.log("Cargando productos...");
        const response = await getProductos();
        console.log("Productos recibidos:", response.data);
        setProductos(response.data || []);
      } catch (error) {
        console.error("Error al obtener productos:", error);
        setError("Error al cargar los productos");
        setProductos([]);
      } finally {
        setLoading(false);
      }
    };
    cargarProductos();
  }, []);

  // 🔹 Manejar filtros avanzados
  const manejarFiltrosAvanzados = async (nuevosFiltros) => {
    setFiltrosAvanzados(nuevosFiltros);
    setPaginaActual(1);
    
    try {
      if (Object.keys(nuevosFiltros).length > 0) {
        const response = await buscarProductosAvanzado(nuevosFiltros);
        setProductos(response.data);
      } else {
        const response = await getProductos();
        setProductos(response.data);
      }
    } catch (error) {
      console.error("Error al aplicar filtros avanzados:", error);
    }
  };

  // 🔹 Filtrar productos localmente
  const productosFiltrados = productos.filter(producto => {
    const coincideBusqueda = 
      producto.name?.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.description?.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.batchCode?.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.chemCode?.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.proveedor?.toLowerCase().includes(busqueda.toLowerCase()) ||
      (producto.category?.name && producto.category.name.toLowerCase().includes(busqueda.toLowerCase()));
    
    const coincideActivo = 
      filtroActivo === "todos" || 
      (filtroActivo === "activos" && producto.activeStatus) ||
      (filtroActivo === "inactivos" && !producto.activeStatus);
    
    const coincideStock =
      filtroStock === "todos" ||
      (filtroStock === "sin-stock" && producto.stock === 0) ||
      (filtroStock === "stock-critico" && producto.stock > 0 && producto.stock <= (producto.stockCritico || 5)) ||
      (filtroStock === "con-stock" && producto.stock > (producto.stockCritico || 5));

    return coincideBusqueda && coincideActivo && coincideStock;
  });

  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const indiceInicio = (paginaActual - 1) * productosPorPagina;
  const indiceFin = indiceInicio + productosPorPagina;
  const productosPagina = productosFiltrados.slice(indiceInicio, indiceFin);

  const handleEliminar = async (id) => {
    const producto = productos.find(p => p.id === id);
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar el producto "${producto?.name || id}"?`
    );
    if (!confirmar) return;

    try {
      setEliminando(id);
      await eliminarProducto(id);
      setProductos((prev) => prev.filter((p) => p.id !== id));
      alert("✅ Producto eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("⚠️ No se pudo eliminar el producto.");
    } finally {
      setEliminando(null);
    }
  };

  const recargarProductos = async () => {
    try {
      setLoading(true);
      const response = await getProductos();
      setProductos(response.data || []);
      setFiltrosAvanzados({});
      setBusqueda("");
      setFiltroActivo("todos");
      setFiltroStock("todos");
    } catch (error) {
      console.error("Error al recargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "—";
    try {
      return new Date(fecha).toLocaleDateString("es-CL");
    } catch {
      return "—";
    }
  };

  const formatearMoneda = (monto) => {
    if (monto === null || monto === undefined) return "—";
    try {
      return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
      }).format(monto);
    } catch {
      return "—";
    }
  };

  const getBadgeStock = (producto) => {
    if (producto.stock === 0) {
      return <span className="badge bg-danger">Sin Stock</span>;
    } else if (producto.stock <= (producto.stockCritico || 5)) {
      return <span className="badge bg-warning text-dark">Stock Crítico</span>;
    } else {
      return <span className="badge bg-success">En Stock</span>;
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando productos...</span>
        </div>
        <p className="mt-2">Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center mt-5">
        {error}
        <br />
        <button 
          className="btn btn-primary mt-2"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="vista-productos-container">
      <header className="productos-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Inventario de Productos</h2>
          {esVendedor && (
            <small className="text-muted">🔐 Permisos de Vendedor: Solo puedes editar productos</small>
          )}
          {esSuperAdmin && (
            <small className="text-muted">⭐ Permisos de Super Admin: Acceso completo</small>
          )}
        </div>

        <div className="d-flex gap-2">
          <button onClick={recargarProductos} className="btn btn-outline-secondary" title="Recargar todos los productos">
            🔄 Recargar
          </button>
          <Link to="/admin/productos/nuevo" className="btn btn-primary">
            + Nuevo Producto
          </Link>
        </div>
      </header>

      <FiltrosAvanzados 
        tipo="productos"
        onFiltrosChange={manejarFiltrosAvanzados}
        initialFiltros={filtrosAvanzados}
      />

      {/* === Tabla === */}
      <section className="productos-table-section">
        <div className="table-responsive shadow-sm rounded-3 overflow-hidden">
          <table className="table table-bordered table-striped align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Lote</th>
                <th>Descripción</th>
                <th>Código Químico</th>
                <th>Categoría</th>
                <th>Costo</th>
                <th>Stock</th>
                <th>Stock Crítico</th>
                <th>Elaboración</th>
                <th>Vencimiento</th>
                <th>Proveedor</th>
                <th>Estado</th>
                <th>Destacado</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosPagina.length === 0 ? (
                <tr>
                  <td colSpan="17" className="text-center text-muted py-4">
                    🚫 No hay productos que coincidan con tu búsqueda
                  </td>
                </tr>
              ) : (
                productosPagina.map((p) => (
                  <tr key={p.id} className={!p.activeStatus ? "table-secondary" : ""}>
                    <td><span className="badge bg-dark">{p.id}</span></td>
                    <td>
                      {p.image ? (
                        <img 
                          src={p.image} 
                          alt={p.name} 
                          className="img-thumbnail"
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = '/wooden.jpg'; }}
                        />
                      ) : (
                        <div className="bg-light d-flex align-items-center justify-content-center rounded"
                          style={{ width: '50px', height: '50px' }}
                          title="Sin imagen">
                          🖼️
                        </div>
                      )}
                    </td>
                    <td><strong>{p.name || "—"}</strong></td>
                    <td>{p.batchCode || "—"}</td>
                    <td><small className="text-muted">{p.description || "—"}</small></td>
                    <td>{p.chemCode || "—"}</td>
                    <td>{p.category?.name || "—"}</td>
                    <td><strong>{formatearMoneda(p.cost)}</strong></td>
                    <td>{getBadgeStock(p)}<br/><small>{p.stock ?? 0} unidades</small></td>
                    <td>{p.stockCritico ?? "—"}</td>
                    <td>{formatearFecha(p.elabDate)}</td>
                    <td>{formatearFecha(p.expDate)}</td>
                    <td>{p.proveedor || "—"}</td>
                    <td>{p.activeStatus ? <span className="badge bg-success">Activo</span> : <span className="badge bg-secondary">Inactivo</span>}</td>
                    <td>{p.destacado ? <span className="badge bg-warning text-dark">⭐</span> : "—"}</td>
                    <td><small>{formatearFecha(p.creationDate)}</small></td>
                    <td>
                      <div className="d-flex flex-column gap-1">
                        <Link to={`/admin/productos/editar/${p.id}`} className="btn btn-sm btn-outline-success">
                          ✏️ Editar
                        </Link>
                        {esSuperAdmin ? (
                          <button
                            onClick={() => handleEliminar(p.id)}
                            className="btn btn-sm btn-outline-danger"
                            disabled={eliminando === p.id}>
                            {eliminando === p.id ? "Eliminando..." : "🗑️ Eliminar"}
                          </button>
                        ) : (
                          <button className="btn btn-sm btn-outline-secondary" disabled>🚫 Eliminar</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* === Paginación IZQUIERDA === */}
      {totalPaginas > 1 && (
        <div className="d-flex align-items-center mt-4">
          {/* Paginador a la izquierda */}
          <nav className="me-3">
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${paginaActual === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                  disabled={paginaActual === 1}>
                  ← Anterior
                </button>
              </li>

              {Array.from({ length: totalPaginas }, (_, i) => {
                if (
                  i === 0 ||
                  i === totalPaginas - 1 ||
                  (i >= paginaActual - 2 && i <= paginaActual + 1)
                ) {
                  return (
                    <li key={i} className={`page-item ${paginaActual === i + 1 ? "active" : ""}`}>
                      <button className="page-link" onClick={() => setPaginaActual(i + 1)}>
                        {i + 1}
                      </button>
                    </li>
                  );
                } else if (i === paginaActual - 3 || i === paginaActual + 2) {
                  return <li key={i} className="page-item disabled"><span className="page-link">...</span></li>;
                }
                return null;
              })}

              <li className={`page-item ${paginaActual === totalPaginas ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                  disabled={paginaActual === totalPaginas}>
                  Siguiente →
                </button>
              </li>
            </ul>
          </nav>

          {/* Texto a la derecha */}
          <div className="text-muted small ms-auto">
            Mostrando {indiceInicio + 1}-{Math.min(indiceFin, productosFiltrados.length)} de {productosFiltrados.length} productos
            {productosFiltrados.length !== productos.length && ` (filtrados de ${productos.length} totales)`}
            {Object.keys(filtrosAvanzados).length > 0 && (
              <span className="ms-2 text-primary">🔍 Con filtros avanzados</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
