import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import './Permisos.css';

const Permisos = () => {
  const [permisos, setPermisos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [mostrarModal, setMostrarModal] = useState(false);
  const [permisoEditando, setPermisoEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form State
  const fechaHoy = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    empleado_id: '',
    tipo: 'Vacaciones',
    fecha_inicio: fechaHoy,
    fecha_fin: fechaHoy,
    dias_solicitados: 1,
    motivo: '',
    estado: 'Pendiente'
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');

      const [resPermisos, resEmpleados] = await Promise.all([
        apiFetch('/permisos'),
        apiFetch('/empleados')
      ]);

      if (resPermisos && resPermisos.ok) {
        const dataPermisos = await resPermisos.json();
        setPermisos(dataPermisos);
      }

      if (resEmpleados && resEmpleados.ok) {
        const dataEmpleados = await resEmpleados.json();
        setEmpleados(dataEmpleados);
      }
    } catch (err) {
      console.error('Error al cargar permisos:', err);
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Calcular automáticamente la diferencia de días
  const calcularDias = (inicio, fin) => {
    if (!inicio || !fin) return 1;
    const dateInicio = new Date(inicio);
    const dateFin = new Date(fin);
    const diffTime = dateFin - dateInicio;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let nuevosDatos = { ...formData, [name]: value };

    if (name === 'fecha_inicio' || name === 'fecha_fin') {
      const diasCalculados = calcularDias(
        name === 'fecha_inicio' ? value : formData.fecha_inicio,
        name === 'fecha_fin' ? value : formData.fecha_fin
      );
      nuevosDatos.dias_solicitados = diasCalculados;
    }

    setFormData(nuevosDatos);
  };

  const abrirModalCrear = () => {
    setPermisoEditando(null);
    setFormData({
      empleado_id: empleados.length > 0 ? empleados[0].id : '',
      tipo: 'Vacaciones',
      fecha_inicio: fechaHoy,
      fecha_fin: fechaHoy,
      dias_solicitados: 1,
      motivo: '',
      estado: 'Pendiente'
    });
    setModalError('');
    setMostrarModal(true);
  };

  const abrirModalEditar = (p) => {
    setPermisoEditando(p);
    setFormData({
      empleado_id: p.empleado_id || '',
      tipo: p.tipo || 'Vacaciones',
      fecha_inicio: p.fecha_inicio ? p.fecha_inicio.split('T')[0] : fechaHoy,
      fecha_fin: p.fecha_fin ? p.fecha_fin.split('T')[0] : fechaHoy,
      dias_solicitados: p.dias_solicitados || 1,
      motivo: p.motivo || '',
      estado: p.estado || 'Pendiente'
    });
    setModalError('');
    setMostrarModal(true);
  };

  const cambiarEstadoDirecto = async (id, nuevoEstado) => {
    try {
      const response = await apiFetch(`/permisos/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (response && response.ok) {
        cargarDatos();
      } else {
        alert('No se pudo cambiar el estado de la solicitud.');
      }
    } catch (err) {
      console.error('Error al cambiar estado:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.empleado_id || !formData.fecha_inicio || !formData.fecha_fin) {
      setModalError('Por favor completa todos los campos requeridos (*).');
      return;
    }

    const esEdicion = Boolean(permisoEditando);
    const endpoint = esEdicion ? `/permisos/${permisoEditando.id}` : '/permisos';
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
        cargarDatos();
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

  // Filtros
  const permisosFiltrados = permisos.filter((p) => {
    const cumpleBusqueda =
      p.empleado_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.empleado_rut?.toLowerCase().includes(busqueda.toLowerCase());

    const cumpleTipo = filtroTipo === 'Todos' || p.tipo === filtroTipo;
    const cumpleEstado = filtroEstado === 'Todos' || p.estado === filtroEstado;

    return cumpleBusqueda && cumpleTipo && cumpleEstado;
  });

  return (
    <div className="permisos-container">
      {/* Header */}
      <div className="modulo-header">
        <div>
          <h2>Gestión de Permisos y Vacaciones</h2>
          <p>Administra las solicitudes de licencias, permisos y días libres del personal.</p>
        </div>
        <button className="btn-primario" onClick={abrirModalCrear}>
          + Nueva Solicitud
        </button>
      </div>

      {/* Toolbar */}
      <div className="tabla-toolbar">
        <input
          type="text"
          placeholder="Buscar por empleado o RUT..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-busqueda"
        />

        <div className="filtros-grupo">
          <div className="filtro-item">
            <label>Tipo: </label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="select-filtro"
            >
              <option value="Todos">Todos</option>
              <option value="Vacaciones">Vacaciones</option>
              <option value="Permiso Administrativo">Permiso Administrativo</option>
              <option value="Licencia Medica">Licencia Médica</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="filtro-item">
            <label>Estado: </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="select-filtro"
            >
              <option value="Todos">Todos</option>
              <option value="Pendiente">Pendientes</option>
              <option value="Aprobado">Aprobados</option>
              <option value="Rechazado">Rechazados</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="mensaje-error">{error}</div>}

      {/* Tabla */}
      <div className="tabla-card">
        {loading ? (
          <div className="cargando">Cargando solicitudes de permisos...</div>
        ) : (
          <table className="tabla-custom">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Tipo</th>
                <th>Fechas (Inicio - Fin)</th>
                <th>Días</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {permisosFiltrados.length > 0 ? (
                permisosFiltrados.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="font-bold">{p.empleado_nombre}</div>
                      {p.empleado_rut && <div className="subtexto">RUT: {p.empleado_rut}</div>}
                    </td>
                    <td>
                      <span className="tipo-badge">{p.tipo}</span>
                    </td>
                    <td>
                      <div>
                        {p.fecha_inicio ? new Date(p.fecha_inicio).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : '-'} al{' '}
                        {p.fecha_fin ? new Date(p.fecha_fin).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : '-'}
                      </div>
                    </td>
                    <td>
                      <span className="font-bold">{p.dias_solicitados} día(s)</span>
                    </td>
                    <td>
                      <span className="subtexto">{p.motivo || 'Sin especificar'}</span>
                    </td>
                    <td>
                      <span className={`badge ${p.estado?.toLowerCase()}`}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="acciones">
                      {p.estado === 'Pendiente' && (
                        <>
                          <button
                            className="btn-accion-icono btn-aprobar"
                            title="Aprobar"
                            onClick={() => cambiarEstadoDirecto(p.id, 'Aprobado')}
                          >
                            ✓
                          </button>
                          <button
                            className="btn-accion-icono btn-rechazar"
                            title="Rechazar"
                            onClick={() => cambiarEstadoDirecto(p.id, 'Rechazado')}
                          >
                            ✕
                          </button>
                        </>
                      )}
                      <button
                        className="btn-accion btn-editar"
                        onClick={() => abrirModalEditar(p)}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="sin-datos">
                    No se encontraron solicitudes de permisos o vacaciones.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Crear/Editar */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <div className="modal-header">
              <h3>{permisoEditando ? 'Editar Solicitud' : 'Nueva Solicitud de Permiso/Vacaciones'}</h3>
              <button className="btn-cerrar" onClick={() => setMostrarModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {modalError && <div className="mensaje-error">{modalError}</div>}

              <div className="form-group">
                <label>Empleado *</label>
                <select
                  name="empleado_id"
                  value={formData.empleado_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccione un empleado...</option>
                  {empleados.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre || `${emp.nombres || ''} ${emp.apellidos || ''}`.trim()} ({emp.rut_dni || 'Sin RUT'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Solicitud *</label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                  >
                    <option value="Vacaciones">Vacaciones</option>
                    <option value="Permiso Administrativo">Permiso Administrativo</option>
                    <option value="Licencia Medica">Licencia Médica</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Estado *</label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Aprobado">Aprobado</option>
                    <option value="Rechazado">Rechazado</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha Inicio *</label>
                  <input
                    type="date"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Fecha Fin *</label>
                  <input
                    type="date"
                    name="fecha_fin"
                    value={formData.fecha_fin}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Días Solicitados</label>
                <input
                  type="number"
                  name="dias_solicitados"
                  value={formData.dias_solicitados}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Motivo / Observaciones</label>
                <textarea
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Detalla la razón del permiso o vacaciones..."
                />
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
                  {guardando ? 'Guardando...' : permisoEditando ? 'Guardar Cambios' : 'Crear Solicitud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Permisos;