import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import './Empleados.css';

const Empleados = () => {
  // Estados principales
  const [empleados, setEmpleados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados del Modal (Crear / Editar)
  const [mostrarModal, setMostrarModal] = useState(false);
  const [empleadoEditando, setEmpleadoEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [modalError, setModalError] = useState('');

  // Estado del Formulario
  const [formData, setFormData] = useState({
    rut_dni: '',
    nombres: '',
    apellidos: '',
    email: '',
    departamento: 'TI',
    puesto: ''
  });

  // 1. Cargar empleados desde el backend
  const cargarEmpleados = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiFetch('/empleados');

      if (response && response.ok) {
        const data = await response.json();
        setEmpleados(data);
      } else {
        setError('No se pudo conectar con la base de datos de empleados.');
      }
    } catch (err) {
      console.error('Error al cargar empleados:', err);
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEmpleados();
  }, []);

  // Manejar inputs del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Abrir Modal para Crear
  const abrirModalCrear = () => {
    setEmpleadoEditando(null);
    setFormData({
      rut_dni: '',
      nombres: '',
      apellidos: '',
      email: '',
      departamento: 'TI',
      puesto: ''
    });
    setModalError('');
    setMostrarModal(true);
  };

  // Abrir Modal para Editar
  const abrirModalEditar = (emp) => {
    setEmpleadoEditando(emp);
    setFormData({
      rut_dni: emp.rut_dni || '',
      nombres: emp.nombres || '',
      apellidos: emp.apellidos || '',
      email: emp.email || '',
      departamento: emp.departamento || 'TI',
      puesto: emp.puesto || ''
    });
    setModalError('');
    setMostrarModal(true);
  };

  // 2. Guardar (POST / PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.nombres || !formData.apellidos || !formData.email || !formData.puesto) {
      setModalError('Por favor completa todos los campos requeridos.');
      return;
    }

    const esEdicion = Boolean(empleadoEditando);
    const endpoint = esEdicion ? `/empleados/${empleadoEditando.id}` : '/empleados';
    const metodo = esEdicion ? 'PUT' : 'POST';

    try {
      setGuardando(true);
      const response = await apiFetch(endpoint, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response && response.ok) {
        setMostrarModal(false);
        cargarEmpleados();
      } else {
        const data = await response.json();
        setModalError(data.mensaje || 'Error al procesar la solicitud.');
      }
    } catch (err) {
      setModalError('Error al conectar con el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  // 3. Cambiar estado (Activar / Desactivar)
  const toggleEstadoEmpleado = async (emp) => {
    const estaActivo = emp.activo === 1 || emp.activo === true || emp.estado === 'Activo';
    const nuevoEstado = estaActivo ? 'Inactivo' : 'Activo';

    try {
      const response = await apiFetch(`/empleados/${emp.id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (response && response.ok) {
        cargarEmpleados();
      } else {
        const data = await response.json();
        alert(data.mensaje || 'Error al cambiar el estado.');
      }
    } catch (err) {
      alert('Error de conexión al cambiar el estado.');
    }
  };

  // 4. Filtros de búsqueda
  const empleadosFiltrados = empleados.filter((emp) => {
    const cumpleBusqueda =
      emp.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      emp.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
      emp.puesto?.toLowerCase().includes(busqueda.toLowerCase()) ||
      emp.departamento?.toLowerCase().includes(busqueda.toLowerCase());

    const estaActivo = emp.activo === 1 || emp.activo === true || emp.estado === 'Activo';
    const cumpleEstado =
      filtroEstado === 'Todos' ||
      (filtroEstado === 'Activo' && estaActivo) ||
      (filtroEstado === 'Inactivo' && !estaActivo);

    return cumpleBusqueda && cumpleEstado;
  });

  return (
    <div className="empleados-container">
      {/* Encabezado */}
      <div className="modulo-header">
        <div>
          <h2>Gestión de Empleados</h2>
          <p>Administra la información, cargos y estado del personal de la empresa.</p>
        </div>
        <button className="btn-primario" onClick={abrirModalCrear}>
          + Nuevo Empleado
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="tabla-toolbar">
        <input
          type="text"
          placeholder="Buscar por nombre, correo, cargo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-busqueda"
        />

        <div className="filtro-estado">
          <label>Estado: </label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="select-filtro"
          >
            <option value="Todos">Todos</option>
            <option value="Activo">Activos</option>
            <option value="Inactivo">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Mensaje de Error global */}
      {error && <div className="mensaje-error">{error}</div>}

      {/* Tabla de Empleados */}
      <div className="tabla-card">
        {loading ? (
          <div className="cargando">Cargando empleados...</div>
        ) : (
          <table className="tabla-custom">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Cargo / Departamento</th>
                <th>Contacto</th>
                <th>Estado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleadosFiltrados.length > 0 ? (
                empleadosFiltrados.map((emp) => {
                  const esActivo = emp.activo === 1 || emp.activo === true || emp.estado === 'Activo';
                  return (
                    <tr key={emp.id}>
                      <td>
                        <div className="font-bold">{emp.nombre}</div>
                        {emp.rut_dni && <div className="subtexto">RUT/DNI: {emp.rut_dni}</div>}
                      </td>
                      <td>
                        <div>{emp.puesto}</div>
                        <div className="subtexto">{emp.departamento}</div>
                      </td>
                      <td>{emp.email}</td>
                      <td>
                        <span className={`badge ${esActivo ? 'activo' : 'inactivo'}`}>
                          {esActivo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="acciones">
                        <button
                          className="btn-accion btn-editar"
                          onClick={() => abrirModalEditar(emp)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-accion btn-estado"
                          onClick={() => toggleEstadoEmpleado(emp)}
                        >
                          {esActivo ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="sin-datos">
                    No se encontraron empleados registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Crear / Editar */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <div className="modal-header">
              <h3>{empleadoEditando ? 'Editar Empleado' : 'Nuevo Empleado'}</h3>
              <button className="btn-cerrar" onClick={() => setMostrarModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {modalError && <div className="mensaje-error">{modalError}</div>}

              <div className="form-group">
                <label>RUT / DNI</label>
                <input
                  type="text"
                  name="rut_dni"
                  value={formData.rut_dni}
                  onChange={handleInputChange}
                  placeholder="Ej: 12345678-9"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nombres *</label>
                  <input
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleInputChange}
                    placeholder="Ej: Juan Antonio"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Apellidos *</label>
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    placeholder="Ej: Pérez Gómez"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Correo Corporativo *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="ejemplo@empresa.com"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Departamento *</label>
                  <select
                    name="departamento"
                    value={formData.departamento}
                    onChange={handleInputChange}
                  >
                    <option value="TI">TI</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="Finanzas">Finanzas</option>
                    <option value="Operaciones">Operaciones</option>
                    <option value="Ventas">Ventas</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Puesto / Cargo *</label>
                  <input
                    type="text"
                    name="puesto"
                    value={formData.puesto}
                    onChange={handleInputChange}
                    placeholder="Ej: Desarrollador Frontend"
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secundario"
                  onClick={() => setMostrarModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primario" disabled={guardando}>
                  {guardando ? 'Guardando...' : empleadoEditando ? 'Guardar Cambios' : 'Crear Empleado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Empleados;