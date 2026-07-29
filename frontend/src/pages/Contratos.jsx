import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import './Contratos.css';

const Contratos = () => {
  const [contratos, setContratos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [mostrarModal, setMostrarModal] = useState(false);
  const [contratoEditando, setContratoEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    empleado_id: '',
    tipo_contrato: 'Indefinido',
    fecha_inicio: '',
    fecha_termino: '',
    salario_base: '',
    moneda: 'CLP',
    jornada_laboral: 'Completa',
    estado: 'Vigente',
    documento_url: ''
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');

      // Carga paralela de contratos y lista de empleados
      const [resContratos, resEmpleados] = await Promise.all([
        apiFetch('/contratos'),
        apiFetch('/empleados')
      ]);

      if (resContratos && resContratos.ok) {
        const dataContratos = await resContratos.json();
        setContratos(dataContratos);
      }

      if (resEmpleados && resEmpleados.ok) {
        const dataEmpleados = await resEmpleados.json();
        setEmpleados(dataEmpleados);
      }
    } catch (err) {
      console.error('Error al cargar datos de contratos:', err);
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
    setContratoEditando(null);
    setFormData({
      empleado_id: empleados.length > 0 ? empleados[0].id : '',
      tipo_contrato: 'Indefinido',
      fecha_inicio: '',
      fecha_termino: '',
      salario_base: '',
      moneda: 'CLP',
      jornada_laboral: 'Completa',
      estado: 'Vigente',
      documento_url: ''
    });
    setModalError('');
    setMostrarModal(true);
  };

  const abrirModalEditar = (c) => {
    setContratoEditando(c);
    setFormData({
      empleado_id: c.empleado_id || '',
      tipo_contrato: c.tipo_contrato || 'Indefinido',
      fecha_inicio: c.fecha_inicio ? c.fecha_inicio.split('T')[0] : '',
      fecha_termino: c.fecha_termino ? c.fecha_termino.split('T')[0] : '',
      salario_base: c.salario_base || '',
      moneda: c.moneda || 'CLP',
      jornada_laboral: c.jornada_laboral || 'Completa',
      estado: c.estado || 'Vigente',
      documento_url: c.documento_url || ''
    });
    setModalError('');
    setMostrarModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.empleado_id || !formData.fecha_inicio || !formData.salario_base) {
      setModalError('Por favor completa todos los campos requeridos (*).');
      return;
    }

    const esEdicion = Boolean(contratoEditando);
    const endpoint = esEdicion ? `/contratos/${contratoEditando.id}` : '/contratos';
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
        setModalError(data.mensaje || 'Error al guardar el contrato.');
      }
    } catch (err) {
      setModalError('Error al conectar con el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  // Filtros
  const contratosFiltrados = contratos.filter((c) => {
    const cumpleBusqueda =
      c.empleado_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.tipo_contrato?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.empleado_rut?.toLowerCase().includes(busqueda.toLowerCase());

    const cumpleEstado =
      filtroEstado === 'Todos' || c.estado === filtroEstado;

    return cumpleBusqueda && cumpleEstado;
  });

  return (
    <div className="contratos-container">
      {/* Header */}
      <div className="modulo-header">
        <div>
          <h2>Gestión de Contratos</h2>
          <p>Administra los tipos de contrato, salarios y vigencias del personal.</p>
        </div>
        <button className="btn-primario" onClick={abrirModalCrear}>
          + Nuevo Contrato
        </button>
      </div>

      {/* Toolbar */}
      <div className="tabla-toolbar">
        <input
          type="text"
          placeholder="Buscar por empleado, RUT o tipo..."
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
            <option value="Vigente">Vigentes</option>
            <option value="Vencido">Vencidos</option>
            <option value="Rescindido">Rescindidos</option>
          </select>
        </div>
      </div>

      {error && <div className="mensaje-error">{error}</div>}

      {/* Tabla */}
      <div className="tabla-card">
        {loading ? (
          <div className="cargando">Cargando contratos...</div>
        ) : (
          <table className="tabla-custom">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Tipo / Jornada</th>
                <th>Vigencia</th>
                <th>Salario Base</th>
                <th>Estado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {contratosFiltrados.length > 0 ? (
                contratosFiltrados.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="font-bold">{c.empleado_nombre}</div>
                      {c.empleado_rut && <div className="subtexto">RUT: {c.empleado_rut}</div>}
                    </td>
                    <td>
                      <div>{c.tipo_contrato}</div>
                      <div className="subtexto">Jornada: {c.jornada_laboral}</div>
                    </td>
                    <td>
                      <div>
                        Inicio: {c.fecha_inicio ? new Date(c.fecha_inicio).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : '-'}
                      </div>
                      <div className="subtexto">
                        Término: {c.fecha_termino ? new Date(c.fecha_termino).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : 'Indefinido'}
                      </div>
                    </td>
                    <td>
                      <div className="font-bold">
                        {c.moneda} ${Number(c.salario_base || 0).toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${c.estado?.toLowerCase()}`}>
                        {c.estado}
                      </span>
                    </td>
                    <td className="acciones">
                      <button
                        className="btn-accion btn-editar"
                        onClick={() => abrirModalEditar(c)}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="sin-datos">
                    No se encontraron contratos registrados.
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
              <h3>{contratoEditando ? 'Editar Contrato' : 'Nuevo Contrato'}</h3>
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
                  <label>Tipo Contrato *</label>
                  <select
                    name="tipo_contrato"
                    value={formData.tipo_contrato}
                    onChange={handleInputChange}
                  >
                    <option value="Indefinido">Indefinido</option>
                    <option value="Plazo Fijo">Plazo Fijo</option>
                    <option value="Por Obra">Por Obra</option>
                    <option value="Honorarios">Honorarios</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Jornada Laboral *</label>
                  <select
                    name="jornada_laboral"
                    value={formData.jornada_laboral}
                    onChange={handleInputChange}
                  >
                    <option value="Completa">Completa</option>
                    <option value="Media">Media</option>
                    <option value="Por Horas">Por Horas</option>
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
                  <label>Fecha Término</label>
                  <input
                    type="date"
                    name="fecha_termino"
                    value={formData.fecha_termino}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Salario Base *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="salario_base"
                    value={formData.salario_base}
                    onChange={handleInputChange}
                    placeholder="Ej: 550000"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Moneda</label>
                  <input
                    type="text"
                    name="moneda"
                    value={formData.moneda}
                    onChange={handleInputChange}
                    placeholder="CLP"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Estado Contrato *</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                >
                  <option value="Vigente">Vigente</option>
                  <option value="Vencido">Vencido</option>
                  <option value="Rescindido">Rescindido</option>
                </select>
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
                  {guardando ? 'Guardando...' : contratoEditando ? 'Guardar Cambios' : 'Crear Contrato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contratos;