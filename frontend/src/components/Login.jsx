import React, { useState } from 'react';
import './Login.css';

// 1. IMPORTA TU LOGOTIPO AQUÍ
// Asegúrate de que la ruta sea correcta (ej: ../assets/logo.png)
import miLogotipo from '../assets/logo.png'; 

function Login() {
  const [credentials, setCredentials] = useState({
    correo: '',
    password: '',
  });

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos de inicio de sesión:', credentials);
    alert(`Intentando ingresar con: ${credentials.correo}`);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          
          {/* 2. REEMPLAZA EL SVG POR TU IMAGEN */}
          <img 
            src={miLogotipo} 
            alt="Logotipo de la Empresa" 
            className="login-logo" 
          />

          <h2>Sistema RRHH</h2>
          <p>Ingresa tus credenciales para acceder</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="correo">Correo Electrónico</label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={credentials.correo}
              onChange={handleChange}
              placeholder="ejemplo@empresa.com"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="login-button">
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;