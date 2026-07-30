const pool = require('../config/database');// Cambia a '../config/db' si esa es tu carpeta de conexión

// 1. Obtener todas las evaluaciones
const obtenerEvaluaciones = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        ev.*, 
        CONCAT(e.nombres, ' ', e.apellidos) AS empleado_nombre, 
        e.puesto,
        CONCAT(ev_emp.nombres, ' ', ev_emp.apellidos) AS evaluador_nombre
      FROM evaluaciones_desempeno ev
      INNER JOIN empleados e ON ev.empleado_id = e.id
      LEFT JOIN empleados ev_emp ON ev.evaluador_id = ev_emp.id
      ORDER BY ev.fecha_evaluacion DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener evaluaciones:', error);
    res.status(500).json({ mensaje: 'Error al obtener las evaluaciones', detalle: error.message });
  }
};

// 2. Crear nueva evaluación
const crearEvaluacion = async (req, res) => {
  try {
    const { 
      empleado_id, 
      evaluador_id, 
      fecha_evaluacion, 
      periodo_evaluado, 
      calificacion, 
      comentarios_fortalezas, 
      comentarios_oportunidades, 
      objetivos_proximo_periodo 
    } = req.body;

    if (!empleado_id || !fecha_evaluacion || !periodo_evaluado || !calificacion) {
      return res.status(400).json({ mensaje: 'Completa los campos obligatorios (*).' });
    }

    // Si no seleccionaron evaluador, asignamos el mismo empleado_id para evitar error NOT NULL en MySQL
    const idEvaluadorFinal = evaluador_id && evaluador_id !== '' ? evaluador_id : empleado_id;

    const [result] = await pool.query(
      `INSERT INTO evaluaciones_desempeno 
       (empleado_id, evaluador_id, fecha_evaluacion, periodo_evaluado, calificacion, comentarios_fortalezas, comentarios_oportunidades, objetivos_proximo_periodo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        empleado_id, 
        idEvaluadorFinal, 
        fecha_evaluacion, 
        periodo_evaluado, 
        calificacion, 
        comentarios_fortalezas || null, 
        comentarios_oportunidades || null, 
        objetivos_proximo_periodo || null
      ]
    );

    res.status(201).json({ mensaje: 'Evaluación registrada exitosamente', id: result.insertId });
  } catch (error) {
    console.error('Error al crear evaluación:', error);
    res.status(500).json({ mensaje: 'Error al guardar la evaluación', detalle: error.message });
  }
};

// 3. Eliminar evaluación
const eliminarEvaluacion = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM evaluaciones_desempeno WHERE id = ?', [id]);
    res.json({ mensaje: 'Evaluación eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar evaluación:', error);
    res.status(500).json({ mensaje: 'Error al eliminar la evaluación' });
  }
};

module.exports = {
  obtenerEvaluaciones,
  crearEvaluacion,
  eliminarEvaluacion
};