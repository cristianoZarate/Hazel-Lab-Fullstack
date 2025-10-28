// components/PruebaCloudinary.jsx
import { useState } from "react";
import { probarConexionCloudinary, subirImagen } from "../services/api";

export function PruebaCloudinary() {
  const [resultado, setResultado] = useState(null);
  const [probando, setProbando] = useState(false);

  const probarConexion = async () => {
    setProbando(true);
    setResultado(null);
    
    try {
      const resultado = await probarConexionCloudinary();
      setResultado(resultado);
    } catch (error) {
      setResultado({ success: false, error: error.message });
    } finally {
      setProbando(false);
    }
  };

  const handleSubirImagenPrueba = async (event) => {
    const archivo = event.target.files[0];
    if (!archivo) return;

    setProbando(true);
    try {
      const url = await subirImagen(archivo);
      setResultado({ 
        success: true, 
        url,
        message: '¡Imagen subida exitosamente!' 
      });
    } catch (error) {
      setResultado({ 
        success: false, 
        error: error.message 
      });
    } finally {
      setProbando(false);
    }
  };


  // En tu PruebaCloudinary.jsx - añade esto para debug
    const probarConfiguracion = () => {
    console.log('🔧 Configuración Cloudinary:', {
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET,
        url: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
    });
    };

    // Añade este botón en el return:
    <button onClick={probarConfiguracion} className="btn btn-info">
    🔧 Ver Configuración
    </button>

  return (
    <div className="card p-4">
      <h4>🧪 Prueba de Cloudinary</h4>
      
      <div className="mb-3">
        <button 
          onClick={probarConexion}
          disabled={probando}
          className="btn btn-primary me-2"
        >
          {probando ? 'Probando...' : 'Probar Conexión'}
        </button>
        
        <input
          type="file"
          accept="image/*"
          onChange={handleSubirImagenPrueba}
          className="d-none"
          id="prueba-imagen"
        />
        <label 
          htmlFor="prueba-imagen" 
          className="btn btn-success"
        >
          📸 Subir Imagen de Prueba
        </label>
      </div>

      {resultado && (
        <div className={`alert ${resultado.success ? 'alert-success' : 'alert-danger'}`}>
          <strong>
            {resultado.success ? '✅ Éxito' : '❌ Error'}
          </strong>
          <br />
          {resultado.message || resultado.error}
          {resultado.url && (
            <>
              <br />
              <strong>URL:</strong> 
              <a href={resultado.url} target="_blank" rel="noopener noreferrer">
                {resultado.url}
              </a>
              <br />
              <img 
                src={resultado.url} 
                alt="Preview" 
                style={{ maxWidth: '200px', marginTop: '10px' }}
              />
            </>
          )}
        </div>
      )}

      {/* Información de ayuda */}
      <div className="mt-3 p-3 bg-light rounded">
        <h6>📋 Para configurar Cloudinary:</h6>
        <ol className="small">
          <li>Ve a tu Dashboard de Cloudinary</li>
          <li>Copia tu <strong>Cloud Name</strong></li>
          <li>Ve a Settings → Upload</li>
          <li>Crea un <strong>Upload Preset</strong> unsigned</li>
          <li>Actualiza las variables en <code>api.js</code></li>
        </ol>
      </div>
    </div>
  );
}