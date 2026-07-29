import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import './Asistencia.css';

const Asistencia = () => {
  const [asistencias, setAsistencias] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [mostrarModal, setMostrarModal] = useState(false);
  const [asistenciaEditando, setAsistenciaEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form State
  const fechaHoy = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    empleado_id: '',
    fecha: fechaHoy,
    hora_entrada: '09:00',
    hora_salida: '',
    estado: 'Presente',
    comentarios: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');

      const [resAsistencias, resEmpleados] = await Promise.all([
        apiFetch('/asistencias'),
        apiFetch('/empleados')
      ]);

      if (resAsistencias && resAsistencias.ok) {
        const dataAsistencias = await resAsistencias.json();
        setAsistencias(dataAsistencias);
      }

      if (resEmpleados && resEmpleados.ok) {
        const dataEmpleados = await resEmpleados.json();
        setEmpleados(dataEmpleados);
      }
    } catch (err) {
      console.error('Error al cargar asistencias:', err);
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const abrirModalCrear = () => {
    setAsistenciaEditando(null);
    setFormData({
      empleado_id: empleados.length > 0 ? empleados[0].id : '',
      fecha: fechaHoy,
      hora_entrada: '09:00',
      hora_salida: '',
      estado: 'Presente',
      comentarios: ''
    });
    setModalError('');
    setMostrarModal(true);
  };

  const abrirModalEditar = (a) => {
    setAsistenciaEditando(a);
    setFormData({
      empleado_id: a.empleado_id || '',
      fecha: a.fecha ? a.fecha.split('T')[0] : fechaHoy,
      hora_entrada: a.hora_entrada || '09:00',
      hora_salida: a.hora_salida || '',
      estado: a.estado || 'Presente',
      comentarios: a.comentarios || ''
    });
    setModalError('');
    setMostrarModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.empleado_id || !formData.fecha || !formData.hora_entrada) {
      setModalError('Por favor completa todos los campos requeridos (*).');
      return;
    }

    const esEdicion = Boolean(asistenciaEditando);
    const endpoint = esEdicion ? `/asistencias/${asistenciaEditando.id}` : '/asistencias';
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
        setModalError(data.mensaje || 'Error al guardar el registro de asistencia.');
      }
    } catch (err) {
      setModalError('Error al conectar con el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  // Filtros
  const asistenciasFiltradas = asistencias.filter((a) => {
    const cumpleBusqueda =
      a.empleado_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.empleado_rut?.toLowerCase().includes(busqueda.toLowerCase());

    const cumpleEstado = filtroEstado === 'Todos' || a.estado === filtroEstado;
    const fechaFormat = a.fecha ? a.fecha.split('T')[0] : '';
    const cumpleFecha = !filtroFecha || fechaFormat === filtroFecha;

    return cumpleBusqueda && cumpleEstado && cumpleFecha;
  });

  return (
    <div className="asistencia-container">
      {/* Header */}
      <div className="modulo-header">
        <div>
          <h2>Control de Asistencia</h2>
          <p>Registra ingresos, salidas, tardanzas e inasistencias del personal.</p>
        </div>
        <button className="btn-primario" onClick={abrirModalCrear}>
          + Marcar Asistencia
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
            <label>Fecha: </label>
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="select-filtro"
            />
          </div>

          <div className="filtro-item">
            <label>Estado: </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="select-filtro"
            >
              <option value="Todos">Todos</option>
              <option value="Presente">Presente</option>
              <option value="Tarde">Tarde</option>
              <option value="Ausente">Ausente</option>
              <option value="Justificado">Justificado</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="mensaje-error">{error}</div>}

      {/* Tabla */}
      <div className="tabla-card">
        {loading ? (
          <div className="cargando">Cargando registros de asistencia...</div>
        ) : (
          <table className="tabla-custom">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Fecha</th>
                <th>Horario Entrada / Salida</th>
                <th>Horas Trabajadas</th>
                <th>Estado</th>
                <th>Comentarios</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asistenciasFiltradas.length > 0 ? (
                asistenciasFiltradas.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="font-bold">{a.empleado_nombre}</div>
                      {a.empleado_rut && <div className="subtexto">RUT: {a.empleado_rut}</div>}
                    </td>
                    <td>
                      {a.fecha ? new Date(a.fecha).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : '-'}
                    </td>
                    <td>
                      <div>Entrada: <span className="hora-texto">{a.hora_entrada || '--:--'}</span></div>
                      <div className="subtexto">Salida: <span className="hora-texto">{a.hora_salida || '--:--'}</span></div>
                    </td>
                    <td>
                      <span className="font-bold">
                        {a.horas_trabajadas != null ? `${a.horas_trabajadas} hrs` : '-'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${a.estado?.toLowerCase()}`}>
                        {a.estado}
                      </span>
                    </td>
                    <td>
                      <span className="subtexto">{a.comentarios || '-'}</span>
                    </td>
                    <td className="acciones">
                      <button
                        className="btn-accion btn-editar"
                        onClick={() => abrirModalEditar(a)}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="sin-datos">
                    No se encontraron registros de asistencia.
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
              <h3>{asistenciaEditando ? 'Editar Asistencia' : 'Marcar Asistencia'}</h3>
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
                  <label>Fecha *</label>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Estado *</label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                  >
                    <option value="Presente">Presente</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Ausente">Ausente</option>
                    <option value="Justificado">Justificado</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Hora Entrada *</label>
                  <input
                    type="time"
                    name="hora_entrada"
                    value={formData.hora_entrada}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hora Salida</label>
                  <input
                    type="time"
                    name="hora_salida"
                    value={formData.hora_salida}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Comentarios / Justificativo</label>
                <textarea
                  name="comentarios"
                  value={formData.comentarios}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Ej: Permiso médico, atraso justificado..."
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
                  {guardando ? 'Guardando...' : asistenciaEditando ? 'Guardar Cambios' : 'Registrar Marca'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Asistencia;