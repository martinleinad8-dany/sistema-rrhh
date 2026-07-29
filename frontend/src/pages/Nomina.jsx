import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import './Nomina.css';

const Nomina = () => {
  const [nominas, setNominas] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados del Modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nominaEditando, setNominaEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [modalError, setModalError] = useState('');

  // Formulario
  const fechaActual = new Date();
  const [formData, setFormData] = useState({
    empleado_id: '',
    periodo_mes: fechaActual.getMonth() + 1,
    periodo_anio: fechaActual.getFullYear(),
    fecha_pago: fechaActual.toISOString().split('T')[0],
    salario_base_pactado: '',
    bonificaciones: 0,
    deducciones: 0,
    estado: 'Pendiente',
    metodo_pago: 'Transferencia'
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');

      const [resNominas, resEmpleados] = await Promise.all([
        apiFetch('/nominas'),
        apiFetch('/empleados')
      ]);

      if (resNominas && resNominas.ok) {
        const dataNominas = await resNominas.json();
        setNominas(dataNominas);
      }

      if (resEmpleados && resEmpleados.ok) {
        const dataEmpleados = await resEmpleados.json();
        setEmpleados(dataEmpleados);
      }
    } catch (err) {
      console.error('Error al cargar nóminas:', err);
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
    setNominaEditando(null);
    setFormData({
      empleado_id: empleados.length > 0 ? empleados[0].id : '',
      periodo_mes: fechaActual.getMonth() + 1,
      periodo_anio: fechaActual.getFullYear(),
      fecha_pago: fechaActual.toISOString().split('T')[0],
      salario_base_pactado: '',
      bonificaciones: 0,
      deducciones: 0,
      estado: 'Pendiente',
      metodo_pago: 'Transferencia'
    });
    setModalError('');
    setMostrarModal(true);
  };

  const abrirModalEditar = (n) => {
    setNominaEditando(n);
    setFormData({
      empleado_id: n.empleado_id || '',
      periodo_mes: n.periodo_mes || 1,
      periodo_anio: n.periodo_anio || fechaActual.getFullYear(),
      fecha_pago: n.fecha_pago ? n.fecha_pago.split('T')[0] : '',
      salario_base_pactado: n.salario_base_pactado || '',
      bonificaciones: n.bonificaciones || 0,
      deducciones: n.deducciones || 0,
      estado: n.estado || 'Pendiente',
      metodo_pago: n.metodo_pago || 'Transferencia'
    });
    setModalError('');
    setMostrarModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.empleado_id || !formData.salario_base_pactado || !formData.fecha_pago) {
      setModalError('Por favor completa todos los campos requeridos (*).');
      return;
    }

    const esEdicion = Boolean(nominaEditando);
    const endpoint = esEdicion ? `/nominas/${nominaEditando.id}` : '/nominas';
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
        setModalError(data.mensaje || 'Error al procesar la nómina.');
      }
    } catch (err) {
      setModalError('Error al conectar con el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  // Cálculo en tiempo real del Salario Neto para el formulario
  const salarioNetoCalculado =
    (Number(formData.salario_base_pactado) || 0) +
    (Number(formData.bonificaciones) || 0) -
    (Number(formData.deducciones) || 0);

  // Nombres de los meses
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Filtros
  const nominasFiltradas = nominas.filter((n) => {
    const cumpleBusqueda =
      n.empleado_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      n.empleado_rut?.toLowerCase().includes(busqueda.toLowerCase());

    const cumpleEstado = filtroEstado === 'Todos' || n.estado === filtroEstado;
    const cumpleAnio = !filtroAnio || n.periodo_anio.toString() === filtroAnio;

    return cumpleBusqueda && cumpleEstado && cumpleAnio;
  });

  return (
    <div className="nomina-container">
      {/* Header */}
      <div className="modulo-header">
        <div>
          <h2>Gestión de Nómina y Liquidaciones</h2>
          <p>Registra y administra los pagos, bonificaciones y deducciones de los empleados.</p>
        </div>
        <button className="btn-primario" onClick={abrirModalCrear}>
          + Generar Liquidación
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
            <label>Año: </label>
            <select
              value={filtroAnio}
              onChange={(e) => setFiltroAnio(e.target.value)}
              className="select-filtro"
            >
              <option value="">Todos</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
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
              <option value="Pagado">Pagados</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="mensaje-error">{error}</div>}

      {/* Tabla */}
      <div className="tabla-card">
        {loading ? (
          <div className="cargando">Cargando registros de nómina...</div>
        ) : (
          <table className="tabla-custom">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Período / Pago</th>
                <th>Sueldo Base</th>
                <th>Bonos / Descuentos</th>
                <th>Sueldo Neto</th>
                <th>Estado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {nominasFiltradas.length > 0 ? (
                nominasFiltradas.map((n) => (
                  <tr key={n.id}>
                    <td>
                      <div className="font-bold">{n.empleado_nombre}</div>
                      {n.empleado_rut && <div className="subtexto">RUT: {n.empleado_rut}</div>}
                    </td>
                    <td>
                      <div>{meses[n.periodo_mes - 1]} {n.periodo_anio}</div>
                      <div className="subtexto">
                        Pago: {n.fecha_pago ? new Date(n.fecha_pago).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : '-'} ({n.metodo_pago})
                      </div>
                    </td>
                    <td>${Number(n.salario_base_pactado || 0).toLocaleString()}</td>
                    <td>
                      <div className="subtexto-bono">+ ${Number(n.bonificaciones || 0).toLocaleString()}</div>
                      <div className="subtexto-descuento">- ${Number(n.deducciones || 0).toLocaleString()}</div>
                    </td>
                    <td>
                      <div className="font-bold neto-monto">
                        ${Number(n.salario_neto || 0).toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${n.estado?.toLowerCase()}`}>
                        {n.estado}
                      </span>
                    </td>
                    <td className="acciones">
                      <button
                        className="btn-accion btn-editar"
                        onClick={() => abrirModalEditar(n)}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="sin-datos">
                    No se encontraron registros de nómina.
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
              <h3>{nominaEditando ? 'Editar Liquidación' : 'Generar Nueva Liquidación'}</h3>
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
                  <label>Mes *</label>
                  <select
                    name="periodo_mes"
                    value={formData.periodo_mes}
                    onChange={handleInputChange}
                  >
                    {meses.map((m, idx) => (
                      <option key={idx + 1} value={idx + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Año *</label>
                  <input
                    type="number"
                    name="periodo_anio"
                    value={formData.periodo_anio}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha de Pago *</label>
                  <input
                    type="date"
                    name="fecha_pago"
                    value={formData.fecha_pago}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Método de Pago *</label>
                  <select
                    name="metodo_pago"
                    value={formData.metodo_pago}
                    onChange={handleInputChange}
                  >
                    <option value="Transferencia">Transferencia</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Efectivo">Efectivo</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Sueldo Base Pactado ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="salario_base_pactado"
                    value={formData.salario_base_pactado}
                    onChange={handleInputChange}
                    placeholder="Ej: 600000"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Bonificaciones ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="bonificaciones"
                    value={formData.bonificaciones}
                    onChange={handleInputChange}
                    placeholder="Ej: 50000"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Deducciones / Descuentos ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="deducciones"
                    value={formData.deducciones}
                    onChange={handleInputChange}
                    placeholder="Ej: 40000"
                  />
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
                    <option value="Pagado">Pagado</option>
                  </select>
                </div>
              </div>

              {/* Muestra previa del cálculo del Salario Neto */}
              <div className="resumen-calculo">
                <span>Sueldo Neto Estimado: </span>
                <strong>${salarioNetoCalculado.toLocaleString()}</strong>
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
                  {guardando ? 'Guardando...' : nominaEditando ? 'Guardar Cambios' : 'Generar Liquidación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Nomina;