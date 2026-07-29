const pool = require('../config/database');// Ajusta a '../db' si la conexión está en la raíz de src

const obtenerMétricasDashboard = async (req, res) => {
  try {
    const fechaHoy = new Date().toISOString().split('T')[0];

    // 1. Total Empleados
    const [resEmpleados] = await pool.query("SELECT COUNT(*) AS total FROM empleados");

    // 2. Permisos Pendientes
    let permisosPendientes = 0;
    try {
      const [resPermisos] = await pool.query(
        "SELECT COUNT(*) AS pendientes FROM permisos WHERE estado = 'Pendiente'"
      );
      permisosPendientes = resPermisos[0]?.pendientes || 0;
    } catch (e) {
      console.log('Nota permisos:', e.message);
    }

    // 3. Asistencia de Hoy (usando la tabla "asistencias")
    let resAsistencia = [];
    try {
      const [rows] = await pool.query(
        "SELECT estado, COUNT(*) AS cantidad FROM asistencias WHERE fecha = ? GROUP BY estado",
        [fechaHoy]
      );
      resAsistencia = rows;
    } catch (e) {
      console.log('Nota asistencias:', e.message);
    }

    // 4. Próximos Contratos a Vencer (adaptado a nombres comunes de columna)
    let resContratosVencer = [];
    try {
      const [rows] = await pool.query(`
        SELECT c.*, CONCAT(e.nombres, ' ', e.apellidos) AS empleado_nombre 
        FROM contratos c
        INNER JOIN empleados e ON c.empleado_id = e.id
        ORDER BY c.id DESC
        LIMIT 5
      `);
      resContratosVencer = rows;
    } catch (e) {
      console.log('Nota contratos:', e.message);
    }

    // 5. Últimas Solicitudes de Permisos
    let resUltimosPermisos = [];
    try {
      const [rows] = await pool.query(`
        SELECT p.*, CONCAT(e.nombres, ' ', e.apellidos) AS empleado_nombre 
        FROM permisos p
        INNER JOIN empleados e ON p.empleado_id = e.id
        ORDER BY p.id DESC
        LIMIT 5
      `);
      resUltimosPermisos = rows;
    } catch (e) {
      console.log('Nota permisos:', e.message);
    }

    res.json({
      empleadosActivos: resEmpleados[0]?.total || 0,
      permisosPendientes,
      asistenciaHoy: resAsistencia,
      contratosPorVencer: resContratosVencer,
      ultimosPermisos: resUltimosPermisos
    });
  } catch (error) {
    console.error('Error al obtener métricas del dashboard:', error);
    res.status(500).json({ mensaje: 'Error al cargar los datos del dashboard', detalle: error.message });
  }
};

module.exports = {
  obtenerMétricasDashboard
};