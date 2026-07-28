import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();

  // 1. Obtener datos del usuario desde localStorage
  const usuarioGuardado = JSON.parse(localStorage.getItem('usuario')) || {};
  const nombreUsuario = usuarioGuardado.nombre || 'Usuario Administrador';
  const rolUsuario = usuarioGuardado.rol || '';

  // 2. Cerrar sesión limpidamente
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-title">
        <h3>Panel de Administración</h3>
      </div>
      <div className="navbar-user">
        <div className="user-info">
          <span className="user-name">{nombreUsuario}</span>
          {rolUsuario && <span className="user-role">({rolUsuario})</span>}
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}

export default Navbar;