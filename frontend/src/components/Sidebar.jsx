import React from 'react';
import './Sidebar.css';
// 1. Importa tu logotipo desde la carpeta assets
import logo from '../assets/logo.png'; 

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        {/* 2. Reemplaza el <h2> por la etiqueta <img> */}
        <img src={logo} alt="Logo RRHH" className="sidebar-logo" />
      </div>
      <nav className="sidebar-menu">
        <ul>
          <li className="active"><a href="#dashboard">📌 Inicio</a></li>
          <li><a href="#empleados">👥 Empleados</a></li>
          <li><a href="#departamentos">🏢 Departamentos</a></li>
          <li><a href="#asistencias">📅 Asistencias</a></li>
          <li><a href="#configuracion">⚙️ Configuración</a></li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;