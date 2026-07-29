import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import './Desempeno.css';

const Desempeno = () => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);

  const [formData, setFormData] = useState({
    empleado_id: '',
    evaluador_id: '',
    fecha_evaluacion: new Date().toISOString().split('T')[0],
    periodo_evaluado: '2026 - Trimestre 1',
    calificacion: '5',
    comentarios_fortalezas: '',
    comentarios_oportunidades: '',
    objetivos_proximo_periodo: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resEval, resEmp] = await Promise.all([
        apiFetch('/desempeno'),
        apiFetch('/empleados')
      ]);

      if (resEval && resEval.ok) {
        const dataEval = await resEval.json();
        setEvaluaciones(Array.isArray(dataEval) ? dataEval : []);
      }
      if (resEmp && resEmp.ok) {
        const dataEmp = await resEmp.json();
        setEmpleados(Array.isArray(dataEmp) ? dataEmp : []);
      }
    } catch (err) {
      console.error('Error al cargar desempeño:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/desempeno', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res && res.ok) {
        setMostrarModal(false);
        setFormData({
          empleado_id: '',
          evaluador_id: '',
          fecha_evaluacion: new Date().toISOString().split('T')[0],
          periodo_evaluado: '2026 - Trimestre 1',
          calificacion: '5',
          comentarios_fortalezas: '',
          comentarios_oportunidades: '',
          objetivos_proximo_periodo: ''
        });
        cargarDatos();
      } else {
        alert('Error al registrar la evaluación');
      }
    } catch (err) {
      console.error('Error al guardar:', err);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Deseas eliminar esta evaluación?')) return;
    try {
      const res = await apiFetch(`/desempeno/${id}`, { method: 'DELETE' });
      if (res && res.ok) cargarDatos();
    } catch (err) {
      console.error('Error al eliminar:', err);
    }
  };

  const renderEstrellas = (calificacion) => {
    const num = Math.round(Number(calificacion));
    return '⭐'.repeat(Math.min(Math.max(num, 1), 5));
  };

  return (
    <div className="desempeno-container">
      <div className="modulo-header">
        <div>
          <h2>Gestión de Desempeño y Evaluaciones</h2>
          <p>Registra y revisa las evaluaciones del personal.</p>
        </div>
        <button className="btn-primario" onClick={() => setMostrarModal(true)}>
          + Nueva Evaluación
        </button>
      </div>

      {loading ? (
        <div className="cargando">Cargando evaluaciones...</div>
      ) : (
        <div className="tabla-responsive card-seccion">
          <table className="tabla-custom">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Evaluador</th>
                <th>Periodo</th>
                <th>Calificación</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {evaluaciones.length > 0 ? (
                evaluaciones.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.empleado_nombre}</strong>
                    </td>
                    <td>{item.evaluador_nombre || 'No asignado'}</td>
                    <td>{item.periodo_evaluado}</td>
                    <td>
                      <span className="puntuacion-num">{item.calificacion} / 5</span>
                      <br />
                      <small>{renderEstrellas(item.calificacion)}</small>
                    </td>
                    <td>
                      {item.fecha_evaluacion
                        ? new Date(item.fecha_evaluacion).toLocaleDateString('es-ES', { timeZone: 'UTC' })
                        : '-'}
                    </td>
                    <td>
                      <button className="btn-accion btn-eliminar" onClick={() => handleEliminar(item.id)}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="sin-datos">
                    No hay evaluaciones registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Nueva Evaluación */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <h3>Nueva Evaluación de Desempeño</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Empleado Evaluado *</label>
                  <select
                    name="empleado_id"
                    value={formData.empleado_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Seleccionar --</option>
                    {empleados.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nombres} {emp.apellidos}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Evaluador (Jefe/Supervisor)</label>
                  <select
                    name="evaluador_id"
                    value={formData.evaluador_id}
                    onChange={handleChange}
                  >
                    <option value="">-- Seleccionar Evaluador --</option>
                    {empleados.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nombres} {emp.apellidos}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label>Periodo Evaluado *</label>
                  <input
                    type="text"
                    name="periodo_evaluado"
                    value={formData.periodo_evaluado}
                    onChange={handleChange}
                    placeholder="Ej: 2026 - Q1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Calificación (1-5) *</label>
                  <select
                    name="calificacion"
                    value={formData.calificacion}
                    onChange={handleChange}
                    required
                  >
                    <option value="5">5 - Sobresaliente ⭐⭐⭐⭐⭐</option>
                    <option value="4">4 - Satisfactorio ⭐⭐⭐⭐</option>
                    <option value="3">3 - Cumple Expectativas ⭐⭐⭐</option>
                    <option value="2">2 - Requiere Mejora ⭐⭐</option>
                    <option value="1">1 - Deficiente ⭐</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Fecha *</label>
                  <input
                    type="date"
                    name="fecha_evaluacion"
                    value={formData.fecha_evaluacion}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Fortalezas Destacadas</label>
                <textarea
                  name="comentarios_fortalezas"
                  rows="2"
                  value={formData.comentarios_fortalezas}
                  onChange={handleChange}
                  placeholder="Aspectos positivos y logros..."
                ></textarea>
              </div>

              <div className="form-group">
                <label>Oportunidades de Mejora</label>
                <textarea
                  name="comentarios_oportunidades"
                  rows="2"
                  value={formData.comentarios_oportunidades}
                  onChange={handleChange}
                  placeholder="Áreas a reforzar..."
                ></textarea>
              </div>

              <div className="form-group">
                <label>Objetivos Próximo Periodo</label>
                <textarea
                  name="objetivos_proximo_periodo"
                  rows="2"
                  value={formData.objetivos_proximo_periodo}
                  onChange={handleChange}
                  placeholder="Metas pactadas para la siguiente evaluación..."
                ></textarea>
              </div>

              <div className="modal-acciones">
                <button type="button" className="btn-secundario" onClick={() => setMostrarModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primario">
                  Guardar Evaluación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Desempeno;