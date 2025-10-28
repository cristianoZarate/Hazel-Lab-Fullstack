import { useEffect, useState } from "react";
import { Navbar } from "../../componentes/Navbar/Navbar";
import { getProductosDestacados } from "../../services/api";
import { agregarItemCarrito } from "../../services/api";

import "../../index.css";

const PLACEHOLDER_IMG = "/wooden.jpg";

const IMAGENES_CARRUSEL = [
  "/empanadas.jpg",
  "/galletas.jpg",
  "/masita.jpg",
  "/pan.jpg",
];


function nombreAImagen(nombre = "") {
  const limpio = nombre
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "");
  return `/img/${limpio}.jpg`;
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function agregarAlCarrito(productoId) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));

  if (!usuario) {
    alert("Debes iniciar sesión para agregar productos al carrito.");
    return;
  }

  try {
    await agregarItemCarrito(usuario.id, productoId, 1);
    alert("Producto agregado al carrito");
    
    // 🔹 Disparar evento global para actualizar todos los componentes
    window.dispatchEvent(new Event('carritoActualizado'));
  } catch (error) {
    console.error("Error al agregar producto al carrito:", error);
    
    // Mensaje de error más específico
    if (error.response?.status === 401) {
      alert("Sesión expirada. Por favor, inicia sesión nuevamente.");
    } else {
      alert("No se pudo agregar el producto al carrito.");
    }
  }
}

export function Home() {
  const [destacados, setDestacados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [indiceImagen, setIndiceImagen] = useState(0);
  const fmt = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  });

  // 🔹 Cargar productos destacados del backend
  useEffect(() => {
    getProductosDestacados()
      .then((res) => {
        setDestacados(res.data);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error al obtener productos destacados:", err);
        setCargando(false);
      });
  }, []);

  // 🔁 Carrusel automático
  useEffect(() => {
    const intervalo = setInterval(() => {
      siguienteImagen();
    }, 5000);
    return () => clearInterval(intervalo);
  }, [indiceImagen]);

  const siguienteImagen = () => {
    setIndiceImagen((prev) =>
      prev === IMAGENES_CARRUSEL.length - 1 ? 0 : prev + 1
    );
  };

  const anteriorImagen = () => {
    setIndiceImagen((prev) =>
      prev === 0 ? IMAGENES_CARRUSEL.length - 1 : prev - 1
    );
  };

  const transformStyle = {
    transform: `translateX(-${indiceImagen * 100}%)`,
  };

  return (
    <>
      <div className="container">
        <Navbar />
      </div>

      <main>
        {/* CARRUSEL HERO */}
        <section className="home-hero">
          <div className="home-hero-images-container" style={transformStyle}>
            {IMAGENES_CARRUSEL.map((imagen, index) => (
              <img
                key={index}
                src={imagen}
                alt={`Imagen hero ${index + 1}`}
                className="home-hero-image"
                onError={(e) => {
                  e.target.src = "/stockcocina.jpg";
                }}
              />
            ))}
          </div>

          {/* Flechas */}
          <button
            className="home-hero-arrow home-hero-arrow-left"
            onClick={anteriorImagen}
            aria-label="Imagen anterior"
          >
            ‹
          </button>
          <button
            className="home-hero-arrow home-hero-arrow-right"
            onClick={siguienteImagen}
            aria-label="Siguiente imagen"
          >
            ›
          </button>

          {/* Indicadores */}
          <div className="home-hero-indicators">
            {IMAGENES_CARRUSEL.map((_, index) => (
              <button
                key={index}
                onClick={() => setIndiceImagen(index)}
                className={`home-hero-indicator ${
                  index === indiceImagen ? "active" : ""
                }`}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>

          {/* Texto sobre el carrusel */}
          <div className="home-hero-text">
            <h1 className="home-hero-title">
              La fórmula del sabor, con rigor científico.
            </h1>
          </div>
        </section>

        {/* PRODUCTOS DESTACADOS */}
        <section className="home-products container">
          <h2 className="home-products-title">Nuestros productos destacados</h2>

          {cargando ? (
            <p className="home-loading">Cargando productos…</p>
          ) : destacados.length === 0 ? (
            <p className="home-no-products">No hay productos destacados.</p>
          ) : (
            <div className="home-products-grid">
              {destacados.map((p) => (
                <article key={p.id} className="home-product-card">
                  <img
                    src={p.image || PLACEHOLDER_IMG}
                    alt={p.name}
                    className="home-product-image"
                  />
                  <h3 className="home-product-name">{p.name}</h3>
                  <p className="home-product-description">
                    {p.description?.substring(0, 120)}
                    {p.description?.length > 120 ? "…" : ""}
                  </p>
                  <p className="home-product-price">{fmt.format(p.cost)}</p>
                  <button
                    type="button"
                    className="home-product-button"
                    onClick={() => {
                      agregarAlCarrito(p.id);
                    }}
                  >
                    Agregar al carrito
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
