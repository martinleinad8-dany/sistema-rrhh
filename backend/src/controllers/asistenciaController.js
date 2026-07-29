const pool = require('../config/database');

// Obtener todos los registros de asistencia con datos del empleado
const obtenerAsistencias = async (req, res) => {
  try {
    const query = `
      SELECT 
        a.*,
        CONCAT(e.nombres, ' ', e.apellidos) AS empleado_nombre,
        e.rut_dni AS empleado_rut
      FROM asistencias a
      INNER JOIN empleados e ON a.empleado_id = e.id
      ORDER BY a.fecha DESC, a.hora_entrada DESC
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener asistencias:', error);
    res.status(500).json({ mensaje: 'Error al obtener los registros de asistencia' });
  }
};

// Registrar entrada/asistencia
const crearAsistencia = async (req, res) => {
  const {
    empleado_id,
    fecha,
    hora_entrada,
    hora_salida,
    estado,
    comentarios
  } = req.body;

  try {
    // Nota: 'horas_trabajadas' se omite por ser STORED GENERATED
    const query = `
      INSERT INTO asistencias 
      (empleado_id, fecha, hora_entrada, hora_salida, estado, comentarios)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
      empleado_id,
      fecha,
      hora_entrada,
      hora_salida || null,
      estado || 'Presente',
      comentarios || null
    ]);

    res.status(201).json({ mensaje: 'Asistencia registrada correctamente', id: result.insertId });
  } catch (error) {
    console.error('Error al crear asistencia:', error);
    res.status(500).json({ mensaje: 'Error al registrar la asistencia' });
  }
};

// Actualizar un registro de asistencia (marcar hora salida, cambiar estado, etc.)
const actualizarAsistencia = async (req, res) => {
  const { id } = req.params;
  const {
    empleado_id,
    fecha,
    hora_entrada,
    hora_salida,
    estado,
    comentarios
  } = req.body;

  try {
    const query = `
      UPDATE asistencias SET 
        empleado_id = ?, 
        fecha = ?, 
        hora_entrada = ?, 
        hora_salida = ?, 
        estado = ?, 
        comentarios = ?
      WHERE id = ?
    `;
    await pool.query(query, [
      empleado_id,
      fecha,
      hora_entrada,
      hora_salida || null,
      estado,
      comentarios || null,
      id
    ]);

    res.json({ mensaje: 'Registro de asistencia actualizado' });
  } catch (error) {
    console.error('Error al actualizar asistencia:', error);
    res.status(500).json({ mensaje: 'Error al actualizar el registro de asistencia' });
  }
};

module.exports = {
  obtenerAsistencias,
  crearAsistencia,
  actualizarAsistencia
};