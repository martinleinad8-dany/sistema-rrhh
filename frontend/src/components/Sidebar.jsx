import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import logo from '../assets/logo.png';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src={logo} alt="Logo RRHH" className="sidebar-logo" />
      </div>
      <nav className="sidebar-menu">
        <ul>
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
              📌 Inicio
            </NavLink>
          </li>
          <li>
            <NavLink to="/empleados" className={({ isActive }) => (isActive ? 'active' : '')}>
              👥 Empleados
            </NavLink>
          </li>
          <li>
            <NavLink to="/contratos" className={({ isActive }) => (isActive ? 'active' : '')}>
              📜 Contratos
            </NavLink>
          </li>
          <li>
            <NavLink to="/nomina" className={({ isActive }) => (isActive ? 'active' : '')}>
              💵 Nómina
            </NavLink>
          </li>
          <li>
            <NavLink to="/asistencia" className={({ isActive }) => (isActive ? 'active' : '')}>
              📅 Asistencia
            </NavLink>
          </li>
          {/* Nuevo ítem para Permisos y Vacaciones */}
          <li>
            <NavLink to="/permisos" className={({ isActive }) => (isActive ? 'active' : '')}>
              📝 Permisos
            </NavLink>
          </li>
          <li>
            <NavLink to="/desempeno" className={({ isActive }) => (isActive ? 'active' : '')}>
              📊 Desempeño
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;