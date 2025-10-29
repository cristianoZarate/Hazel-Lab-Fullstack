import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getItemsCarritoPorUsuario } from "../../services/api";

export default function Checkout() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Preferimos mantener estas selecciones en el frontend, sin persistir
  const [metodoEnvio, setMetodoEnvio] = useState("retiro"); // retiro | estandar | express
  const [metodoPago, setMetodoPago] = useState("");         // tarjeta | transferencia | efectivo

  const fmt = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" });

  // ⚠️ Igual que en Carrito.jsx: obtiene el usuario desde la misma clave
  const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));

  // Cargar carrito desde backend (misma API)
  useEffect(() => {
    const cargar = async () => {
      if (!usuario) {
        setError("Debes iniciar sesión para continuar con el pago.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await getItemsCarritoPorUsuario(usuario.id);
        const data = Array.isArray(res?.data) ? res.data : [];
        setItems(data);
      } catch (e) {
        console.error(e);
        setError("No se pudo cargar tu carrito.");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []); // solo al montar

  const subtotal = useMemo(
    () => items.reduce((acc, it) => acc + Number(it.producto?.cost ?? 0) * Number(it.quantity ?? 1), 0),
    [items]
  );

  const costoEnvio = useMemo(() => {
    if (metodoEnvio === "estandar") return 3990;
    if (metodoEnvio === "express") return 6990;
    return 0; // retiro
  }, [metodoEnvio]);

  const total = useMemo(() => subtotal + costoEnvio, [subtotal, costoEnvio]);

  const confirmar = () => {
    if (!usuario) {
      navigate("/login");
      return;
    }
    if (!items.length) {
      alert("Tu carrito está vacío.");
      navigate("/carrito");
      return;
    }
    if (!metodoPago) {
      alert("Selecciona un método de pago.");
      return;
    }
    // Solo demostración visual
    alert("✅ (Demo) Pedido listo para enviar al backend.\n\n" +
      `Envío: ${metodoEnvio}\n` +
      `Pago: ${metodoPago}\n` +
      `Total: ${fmt.format(total)}`
    );
    // Aquí luego harás POST al backend (orden + detalle)
  };

  if (loading) return <p className="text-center my-5">Preparando tu checkout…</p>;

  if (error) {
    return (
      <div className="container my-5 text-center">
        <p>{error}</p>
        {!usuario && (
          <Link to="/login" className="btn btn-primary mt-3">
            Iniciar sesión
          </Link>
        )}
      </div>
    );
  }

  return (
    <main className="container my-5" style={{ maxWidth: 1100 }}>
      <h1 className="mb-4" style={{ color: "#587042", fontWeight: 700, textAlign: "center" }}>
        ✅ Checkout
      </h1>

      {items.length === 0 ? (
        <div className="text-center">
          <p>No tienes productos en tu carrito.</p>
          <Link to="/productos" className="btn btn-primary">Ir a productos</Link>
        </div>
      ) : (
        <div className="row g-3">
          {/* Columna izquierda: datos */}
          <section className="col-12 col-lg-7">
            <div className="p-3 border rounded-3" style={{ background: "#fafafa" }}>
              <h5 className="mb-3" style={{ color: "#587042", fontWeight: 700 }}>Método de entrega</h5>
              <select
                className="form-select mb-3"
                value={metodoEnvio}
                onChange={(e) => setMetodoEnvio(e.target.value)}
              >
                <option value="retiro">Retiro en tienda (Gratis)</option>
                <option value="estandar">Envío estándar ({fmt.format(3990)})</option>
                <option value="express">Envío express ({fmt.format(6990)})</option>
              </select>

              <h5 className="mb-3" style={{ color: "#587042", fontWeight: 700 }}>Método de pago</h5>
              <select
                className="form-select"
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
              >
                <option value="">-- Selecciona --</option>
                <option value="tarjeta">Tarjeta débito/crédito</option>
                <option value="transferencia">Transferencia</option>
                <option value="efectivo">Efectivo (retiro)</option>
              </select>

              <div className="d-flex gap-2 mt-3">
                <Link to="/carrito" className="btn btn-light">← Volver al carrito</Link>
                <button className="btn" style={{ background: "#587042", color: "white", fontWeight: 600 }} onClick={confirmar}>
                  Confirmar compra
                </button>
              </div>
            </div>
          </section>

          {/* Columna derecha: resumen */}
          <aside className="col-12 col-lg-5">
            <div className="p-3 border rounded-3">
              <h5 className="mb-3" style={{ color: "#587042", fontWeight: 700 }}>Resumen del pedido</h5>

              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th style={{ width: "55%" }}>Producto</th>
                      <th className="text-end" style={{ width: "15%" }}>Cant.</th>
                      <th className="text-end" style={{ width: "30%" }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it) => {
                      const nombre = it.producto?.name ?? "Producto";
                      const precio = Number(it.producto?.cost ?? 0);
                      const qty = Number(it.quantity ?? 1);
                      return (
                        <tr key={it.id}>
                          <td>{nombre}</td>
                          <td className="text-end">x{qty}</td>
                          <td className="text-end">{fmt.format(precio * qty)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <hr />

              <div className="d-flex justify-content-between">
                <span>Subtotal</span>
                <span>{fmt.format(subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Envío</span>
                <span>{metodoEnvio === "retiro" ? "Gratis" : fmt.format(costoEnvio)}</span>
              </div>

              <div className="d-flex justify-content-between mt-2" style={{ fontSize: 18, fontWeight: 700 }}>
                <span>Total</span>
                <span>{fmt.format(total)}</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
