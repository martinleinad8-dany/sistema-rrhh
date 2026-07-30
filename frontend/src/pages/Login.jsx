import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import "../components/Login.css";

import logoDDI from '../assets/logo.png';

const Login = () => {
  // Estado local usando las claves que mapearemos al backend
  const [formData, setFormData] = useState({ correo: '', contraseña: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Mapeamos los datos enviando las propiedades estándar 'email' y 'password'
    // (o 'correo' / 'password' según el requerimiento exacto de tu API)
    const payload = {
      email: formData.correo,
      password: formData.contraseña,
      // Si tu backend usa exactamente correo/password, descomenta la siguiente línea:
      // correo: formData.correo,
    };

    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload), // Mantenemos JSON.stringify para evitar "[object Object]"
      });

      if (res && res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        navigate('/dashboard');
      } else {
        const errData = await res?.json();
        setError(errData?.mensaje || errData?.message || 'Por favor, ingrese correo y contraseña.');
      }
    } catch (err) {
      console.error("Error en el envío:", err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src={logoDDI} alt="DDI Software" className="login-logo" />
          <h2>Iniciar Sesión</h2>
          <p>Sistema de Gestión de Recursos Humanos</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="correo">CORREO ELECTRÓNICO</label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              placeholder="ejemplo@correo.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contraseña">CONTRASEÑA</label>
            <input
              type="password"
              id="contraseña"
              name="contraseña"
              value={formData.contraseña}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;