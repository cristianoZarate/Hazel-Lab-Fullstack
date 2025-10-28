import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getItemsCarritoPorUsuario,
  eliminarItemCarrito,
  actualizarItemCarrito,
} from "../../services/api";
import "../../index.css";

export function Carrito() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fmt = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  });

  const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));

  // 🔹 Cargar items del carrito
  const cargarCarrito = async () => {
    if (!usuario) {
      setError("Debes iniciar sesión para ver tu carrito.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getItemsCarritoPorUsuario(usuario.id);
      const data = Array.isArray(res.data) ? res.data : [];
      setItems(data);
      calcularTotal(data);
    } catch (err) {
      console.error("Error al obtener carrito:", err);
      setError("No se pudo cargar el carrito.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCarrito();
  }, []);

  // 🔹 Escuchar eventos de actualización
  useEffect(() => {
    const handleCarritoActualizado = () => {
      cargarCarrito();
    };

    window.addEventListener('carritoActualizado', handleCarritoActualizado);
    return () => {
      window.removeEventListener('carritoActualizado', handleCarritoActualizado);
    };
  }, []);

  const calcularTotal = (lista) => {
    const totalCalc = lista.reduce(
      (suma, item) => suma + (item.producto?.cost || 0) * item.quantity,
      0
    );
    setTotal(totalCalc);
  };

  const actualizarCantidad = async (item, nuevaCantidad) => {
    try {
      await actualizarItemCarrito(item.id, nuevaCantidad);
      const nuevos = items.map((it) =>
        it.id === item.id ? { ...it, quantity: nuevaCantidad } : it
      );
      setItems(nuevos);
      calcularTotal(nuevos);
      
      // 🔹 Actualizar otros componentes
      window.dispatchEvent(new Event('carritoActualizado'));
    } catch (err) {
      console.error("Error al actualizar cantidad:", err);
      alert("No se pudo actualizar la cantidad.");
    }
  };

  const aumentarCantidad = (item) =>
    actualizarCantidad(item, item.quantity + 1);

  const disminuirCantidad = (item) => {
    if (item.quantity > 1) actualizarCantidad(item, item.quantity - 1);
  };

  const quitarDelCarrito = async (id) => {
    if (!window.confirm("¿Eliminar este producto del carrito?")) return;
    try {
      await eliminarItemCarrito(id);
      const nuevos = items.filter((it) => it.id !== id);
      setItems(nuevos);
      calcularTotal(nuevos);
      
      // 🔹 Actualizar otros componentes
      window.dispatchEvent(new Event('carritoActualizado'));
    } catch (err) {
      console.error("Error al eliminar producto:", err);
      alert("No se pudo eliminar el producto.");
    }
  };

  if (loading) return <p className="text-center my-5">Cargando carrito...</p>;

  if (error)
    return (
      <div className="text-center my-5">
        <p>{error}</p>
        <Link to="/login" className="btn btn-primary mt-3">
          Iniciar sesión
        </Link>
      </div>
    );

  return (
    <main className="container my-5">
      <h1
        className="mb-4"
        style={{ color: "#587042", fontWeight: "700", textAlign: "center" }}
      >
        🛒 Tu Carrito
      </h1>

      {items.length === 0 ? (
        <div className="text-center">
          <p>El carrito está vacío.</p>
          <Link to="/productos" className="btn btn-primary">
            Ir a productos
          </Link>
        </div>
      ) : (
        <>
          <table className="table table-bordered align-middle">
            <thead style={{ backgroundColor: "#DAD7CD" }}>
              <tr>
                <th>Producto</th>
                <th>Precio Unitario</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.producto?.name || "Sin nombre"}</td>
                  <td>{fmt.format(item.producto?.cost || 0)}</td>
                  <td>
                    <div className="d-flex justify-content-center align-items-center gap-2">
                      <button
                        className="btn btn-sm"
                        style={{
                          backgroundColor: "#FAFAFA",
                          color: "#587042",
                          border: "1px solid #8C9A6C",
                        }}
                        onClick={() => disminuirCantidad(item)}
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span style={{ minWidth: "25px", textAlign: "center" }}>
                        {item.quantity}
                      </span>
                      <button
                        className="btn btn-sm"
                        style={{
                          backgroundColor: "#8C9A6C",
                          color: "white",
                          border: "1px solid #8C9A6C",
                        }}
                        onClick={() => aumentarCantidad(item)}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>{fmt.format((item.producto?.cost || 0) * item.quantity)}</td>
                  <td>
                    <button
                      className="btn btn-sm"
                      style={{
                        backgroundColor: "#486d53ff",
                        color: "white",
                        border: "none",
                        transition: "0.2s",
                      }}
                      onClick={() => quitarDelCarrito(item.id)}
                      onMouseOver={(e) =>
                        (e.target.style.backgroundColor = "#bd5851ff")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.backgroundColor = "#486d53ff")
                      }
                    >
                      🗑 Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-end mt-3 fs-5" style={{ color: "#587042" }}>
            <strong>Total: {fmt.format(total)}</strong>
          </p>

          <div className="d-flex justify-content-between mt-4">
            <Link
              to="/productos"
              className="btn"
              style={{
                backgroundColor: "#DAD7CD",
                color: "#587042",
                fontWeight: "500",
              }}
            >
              ← Seguir comprando
            </Link>
            <Link
              to="/checkout"
              className="btn"
              style={{
                backgroundColor: "#587042",
                color: "white",
                fontWeight: "600",
              }}
            >
              Proceder al Pago →
            </Link>
          </div>
        </>
      )}
    </main>
  );
}