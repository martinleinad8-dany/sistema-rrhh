import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import './Empleados.css';

const Empleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Cargar la lista de empleados al montar el componente
  useEffect(() => {
    obtenerEmpleados();
  }, []);

  const obtenerEmpleados = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/empleados');
      if (response && response.ok) {
        const data = await response.json();
        setEmpleados(data);
      } else {
        setError('No se pudieron cargar los empleados.');
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Filtrar empleados según lo que escriba el usuario
  const empleadosFiltrados = empleados.filter((emp) =>
    emp.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    emp.puesto?.toLowerCase().includes(busqueda.toLowerCase()) ||
    emp.departamento?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="empleados-container">
      {/* Cabecera del módulo */}
      <div className="modulo-header">
        <div>
          <h2>Gestión de Empleados</h2>
          <p>Administra la información de tu personal</p>
        </div>
        <button className="btn-primario">+ Nuevo Empleado</button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="tabla-toolbar">
        <input
          type="text"
          placeholder="Buscar por nombre, puesto o departamento..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-busqueda"
        />
      </div>

      {/* Mensajes de Estado */}
      {error && <div className="mensaje-error">{error}</div>}

      {/* Tabla de Empleados */}
      <div className="tabla-card">
        {loading ? (
          <div className="cargando">Cargando empleados...</div>
        ) : (
          <table className="tabla-custom">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Puesto</th>
                <th>Departamento</th>
                <th>Correo</th>
                <th>Estatus</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleadosFiltrados.length > 0 ? (
                empleadosFiltrados.map((emp) => (
                  <tr key={emp.id}>
                    <td className="font-bold">{emp.nombre}</td>
                    <td>{emp.puesto}</td>
                    <td>{emp.departamento}</td>
                    <td>{emp.email}</td>
                    <td>
                      <span className={`badge ${emp.activo ? 'activo' : 'inactivo'}`}>
                        {emp.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="acciones">
                      <button className="btn-accion btn-editar">Editar</button>
                      <button className="btn-accion btn-estado">
                        {emp.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="sin-datos">
                    No se encontraron empleados registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Empleados;