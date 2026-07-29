const pool = require('../config/database'); 

// Obtener todas las solicitudes de permisos/vacaciones con datos del empleado
const obtenerPermisos = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.*,
        CONCAT(e.nombres, ' ', e.apellidos) AS empleado_nombre,
        e.rut_dni AS empleado_rut
      FROM permisos p
      INNER JOIN empleados e ON p.empleado_id = e.id
      ORDER BY p.creado_en DESC
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener permisos:', error);
    res.status(500).json({ mensaje: 'Error al obtener las solicitudes de permisos' });
  }
};

// Registrar una nueva solicitud de permiso o vacaciones
const crearPermiso = async (req, res) => {
  const {
    empleado_id,
    tipo,
    fecha_inicio,
    fecha_fin,
    dias_solicitados,
    motivo,
    estado
  } = req.body;

  try {
    const query = `
      INSERT INTO permisos 
      (empleado_id, tipo, fecha_inicio, fecha_fin, dias_solicitados, motivo, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
      empleado_id,
      tipo || 'Permiso Administrativo',
      fecha_inicio,
      fecha_fin,
      dias_solicitados || 1,
      motivo || null,
      estado || 'Pendiente'
    ]);

    res.status(201).json({ mensaje: 'Solicitud registrada correctamente', id: result.insertId });
  } catch (error) {
    console.error('Error al crear permiso:', error);
    res.status(500).json({ mensaje: 'Error al registrar la solicitud' });
  }
};

// Actualizar una solicitud (modificar datos o aprobar/rechazar)
const actualizarPermiso = async (req, res) => {
  const { id } = req.params;
  const {
    empleado_id,
    tipo,
    fecha_inicio,
    fecha_fin,
    dias_solicitados,
    motivo,
    estado
  } = req.body;

  try {
    const query = `
      UPDATE permisos SET 
        empleado_id = ?, 
        tipo = ?, 
        fecha_inicio = ?, 
        fecha_fin = ?, 
        dias_solicitados = ?, 
        motivo = ?, 
        estado = ?
      WHERE id = ?
    `;
    await pool.query(query, [
      empleado_id,
      tipo,
      fecha_inicio,
      fecha_fin,
      dias_solicitados,
      motivo || null,
      estado,
      id
    ]);

    res.json({ mensaje: 'Solicitud actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar permiso:', error);
    res.status(500).json({ mensaje: 'Error al actualizar la solicitud' });
  }
};

// Cambiar directamente el estado (Aprobar / Rechazar)
const cambiarEstadoPermiso = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    await pool.query('UPDATE permisos SET estado = ? WHERE id = ?', [estado, id]);
    res.json({ mensaje: `Solicitud ${estado.toLowerCase()} con éxito` });
  } catch (error) {
    console.error('Error al cambiar estado del permiso:', error);
    res.status(500).json({ mensaje: 'Error al modificar el estado' });
  }
};

module.exports = {
  obtenerPermisos,
  crearPermiso,
  actualizarPermiso,
  cambiarEstadoPermiso
};