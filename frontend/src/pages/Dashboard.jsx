import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [metricas, setMetricas] = useState({
    empleadosActivos: 0,
    permisosPendientes: 0,
    asistenciaHoy: [],
    contratosPorVencer: [],
    ultimosPermisos: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/dashboard/metricas');
      if (res && res.ok) {
        const data = await res.json();
        setMetricas(data);
      }
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Procesar asistencia de hoy
  const presentes = metricas.asistenciaHoy?.find(a => a.estado === 'Presente')?.cantidad || 0;
  const ausentes = metricas.asistenciaHoy?.find(a => a.estado === 'Ausente')?.cantidad || 0;
  const tardanzas = metricas.asistenciaHoy?.find(a => a.estado === 'Tardanza')?.cantidad || 0;

  return (
    <div className="dashboard-container">
      <div className="modulo-header">
        <div>
          <h2>Panel Principal (Dashboard)</h2>
          <p>Bienvenido al Sistema de Gestión de Recursos Humanos.</p>
        </div>
      </div>

      {loading ? (
        <div className="cargando">Cargando datos del panel...</div>
      ) : (
        <>
          {/* Tarjetas de KPIs */}
          <div className="kpi-grid">
            <div className="kpi-card azul">
              <div className="kpi-icon">👥</div>
              <div className="kpi-info">
                <h3>{metricas.empleadosActivos}</h3>
                <p>Empleados Activos</p>
              </div>
            </div>

            <div className="kpi-card verde">
              <div className="kpi-icon">✅</div>
              <div className="kpi-info">
                <h3>{presentes}</h3>
                <p>Asistencias de Hoy</p>
              </div>
            </div>

            <div className="kpi-card amarillo">
              <div className="kpi-icon">📝</div>
              <div className="kpi-info">
                <h3>{metricas.permisosPendientes}</h3>
                <p>Permisos Pendientes</p>
              </div>
            </div>

            <div className="kpi-card rojo">
              <div className="kpi-icon">⏰</div>
              <div className="kpi-info">
                <h3>{tardanzas + ausentes}</h3>
                <p>Ausencias / Tardanzas Hoy</p>
              </div>
            </div>
          </div>

          {/* Secciones del Dashboard */}
          <div className="dashboard-grid">
            {/* Próximos Vencimientos de Contratos */}
            <div className="card-seccion">
              <div className="card-seccion-header">
                <h3>📜 Contratos por Vencer (30 días)</h3>
                <Link to="/contratos" className="btn-link">Ver todos</Link>
              </div>
              <table className="tabla-custom">
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Vence El</th>
                  </tr>
                </thead>
                <tbody>
                  {metricas.contratosPorVencer.length > 0 ? (
                    metricas.contratosPorVencer.map((c) => (
                      <tr key={c.id}>
                        <td>{c.empleado_nombre}</td>
                        <td>
                          <span className="badge-alerta">
                            {new Date(c.fecha_fin).toLocaleDateString('es-ES', { timeZone: 'UTC' })}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="sin-datos">No hay contratos próximos a vencer.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Últimas Solicitudes de Permisos */}
            <div className="card-seccion">
              <div className="card-seccion-header">
                <h3>📝 Últimas Solicitudes de Permisos</h3>
                <Link to="/permisos" className="btn-link">Ver todos</Link>
              </div>
              <table className="tabla-custom">
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {metricas.ultimosPermisos.length > 0 ? (
                    metricas.ultimosPermisos.map((p) => (
                      <tr key={p.id}>
                        <td>{p.empleado_nombre}</td>
                        <td>{p.tipo}</td>
                        <td>
                          <span className={`badge ${p.estado?.toLowerCase()}`}>
                            {p.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="sin-datos">No hay solicitudes recientes.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;