import React from 'react';
import './Navbar.css';

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-title">
        <h3>Panel de Administración</h3>
      </div>
      <div className="navbar-user">
        <span className="user-name">Usuario Administrador</span>
        <button className="logout-btn">Cerrar Sesión</button>
      </div>
    </header>
  );
}

export default Navbar;