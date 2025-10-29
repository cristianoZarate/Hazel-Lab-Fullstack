import { useState } from "react";
import { Navbar } from "../../componentes/Navbar/Navbar";
import "./Contacto.css";

export function Contacto() {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    comentario: "",
  });

  const [mensajeExito, setMensajeExito] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMensajeExito(true);
    setFormData({ nombre: "", correo: "", comentario: "" });
  };

  return (
    <>
      <div className="container">
        <Navbar />
      </div>

      <main className="container my-5">
        <h1 className="text-center mb-4">Contacto</h1>

        <form
          onSubmit={handleSubmit}
          id="form-contacto"
          className="mx-auto contacto-form"
        >
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            maxLength="100"
            value={formData.nombre}
            onChange={handleChange}
            className="form-control"
          />

          <label htmlFor="correo">Correo</label>
          <input
            id="correo"
            name="correo"
            type="email"
            maxLength="100"
            value={formData.correo}
            onChange={handleChange}
            className="form-control"
          />

          <label htmlFor="comentario">Comentario</label>
          <textarea
            id="comentario"
            name="comentario"
            required
            maxLength="500"
            value={formData.comentario}
            onChange={handleChange}
            className="form-control"
            rows="4"
          ></textarea>

          <button type="submit" className="btn contacto-btn mt-3">
            Enviar
          </button>
        </form>

        {mensajeExito && (
          <div id="mensaje-exito" className="text-center mt-4 contacto-exito">
            ¡Se realizó con éxito!
          </div>
        )}
      </main>
    </>
  );
}
