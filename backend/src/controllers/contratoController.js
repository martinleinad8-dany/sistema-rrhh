const pool = require('../config/database'); // Ajusta la ruta a tu conexión DB si difiere

// Obtener todos los contratos (con el nombre del empleado mediante JOIN)
const obtenerContratos = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.*, 
        CONCAT(e.nombres, ' ', e.apellidos) AS empleado_nombre,
        e.rut_dni AS empleado_rut
      FROM contratos c
      INNER JOIN empleados e ON c.empleado_id = e.id
      ORDER BY c.creado_en DESC
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener contratos:', error);
    res.status(500).json({ mensaje: 'Error al obtener contratos de la base de datos' });
  }
};

// Crear un nuevo contrato
const crearContrato = async (req, res) => {
  const {
    empleado_id,
    tipo_contrato,
    fecha_inicio,
    fecha_termino,
    salario_base,
    moneda,
    jornada_laboral,
    estado,
    documento_url
  } = req.body;

  try {
    const query = `
      INSERT INTO contratos 
      (empleado_id, tipo_contrato, fecha_inicio, fecha_termino, salario_base, moneda, jornada_laboral, estado, documento_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
      empleado_id,
      tipo_contrato,
      fecha_inicio,
      fecha_termino || null,
      salario_base,
      moneda || 'CLP',
      jornada_laboral,
      estado || 'Vigente',
      documento_url || null
    ]);

    res.status(201).json({ mensaje: 'Contrato creado exitosamente', id: result.insertId });
  } catch (error) {
    console.error('Error al crear contrato:', error);
    res.status(500).json({ mensaje: 'Error al registrar el contrato' });
  }
};

// Actualizar contrato
const actualizarContrato = async (req, res) => {
  const { id } = req.params;
  const {
    empleado_id,
    tipo_contrato,
    fecha_inicio,
    fecha_termino,
    salario_base,
    moneda,
    jornada_laboral,
    estado,
    documento_url
  } = req.body;

  try {
    const query = `
      UPDATE contratos SET 
        empleado_id = ?, 
        tipo_contrato = ?, 
        fecha_inicio = ?, 
        fecha_termino = ?, 
        salario_base = ?, 
        moneda = ?, 
        jornada_laboral = ?, 
        estado = ?, 
        documento_url = ?
      WHERE id = ?
    `;
    await pool.query(query, [
      empleado_id,
      tipo_contrato,
      fecha_inicio,
      fecha_termino || null,
      salario_base,
      moneda,
      jornada_laboral,
      estado,
      documento_url || null,
      id
    ]);

    res.json({ mensaje: 'Contrato actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar contrato:', error);
    res.status(500).json({ mensaje: 'Error al actualizar el contrato' });
  }
};

// Cambiar estado del contrato (Vigente, Vencido, Rescindido)
const cambiarEstadoContrato = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    await pool.query('UPDATE contratos SET estado = ? WHERE id = ?', [estado, id]);
    res.json({ mensaje: 'Estado del contrato actualizado' });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ mensaje: 'Error al modificar estado del contrato' });
  }
};

module.exports = {
  obtenerContratos,
  crearContrato,
  actualizarContrato,
  cambiarEstadoContrato
};