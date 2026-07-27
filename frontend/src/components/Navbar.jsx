import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-title">
        <h3>Panel de Administración</h3>
      </div>
      <div className="navbar-user">
        <span className="user-name">Usuario Administrador</span>
        <button className="logout-btn" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}

export default Navbar;