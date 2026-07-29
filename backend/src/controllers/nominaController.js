const pool = require('../config/database'); // Ajusta a tu conexión si difiere

// Obtener todas las nóminas con información del empleado
const obtenerNominas = async (req, res) => {
  try {
    const query = `
      SELECT 
        n.*,
        CONCAT(e.nombres, ' ', e.apellidos) AS empleado_nombre,
        e.rut_dni AS empleado_rut
      FROM nominas n
      INNER JOIN empleados e ON n.empleado_id = e.id
      ORDER BY n.periodo_anio DESC, n.periodo_mes DESC, n.creado_en DESC
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener nóminas:', error);
    res.status(500).json({ mensaje: 'Error al obtener la lista de nóminas' });
  }
};

// Crear un nuevo registro de nómina
const crearNomina = async (req, res) => {
  const {
    empleado_id,
    periodo_mes,
    periodo_anio,
    fecha_pago,
    salario_base_pactado,
    bonificaciones,
    deducciones,
    estado,
    metodo_pago
  } = req.body;

  try {
    // Nota: 'salario_neto' no se inserta por ser STORED GENERATED
    const query = `
      INSERT INTO nominas 
      (empleado_id, periodo_mes, periodo_anio, fecha_pago, salario_base_pactado, bonificaciones, deducciones, estado, metodo_pago)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
      empleado_id,
      periodo_mes,
      periodo_anio,
      fecha_pago,
      salario_base_pactado,
      bonificaciones || 0.00,
      deducciones || 0.00,
      estado || 'Pendiente',
      metodo_pago || 'Transferencia'
    ]);

    res.status(201).json({ mensaje: 'Nómina registrada exitosamente', id: result.insertId });
  } catch (error) {
    console.error('Error al crear nómina:', error);
    res.status(500).json({ mensaje: 'Error al registrar la nómina' });
  }
};

// Actualizar una nómina existente
const actualizarNomina = async (req, res) => {
  const { id } = req.params;
  const {
    empleado_id,
    periodo_mes,
    periodo_anio,
    fecha_pago,
    salario_base_pactado,
    bonificaciones,
    deducciones,
    estado,
    metodo_pago
  } = req.body;

  try {
    const query = `
      UPDATE nominas SET 
        empleado_id = ?, 
        periodo_mes = ?, 
        periodo_anio = ?, 
        fecha_pago = ?, 
        salario_base_pactado = ?, 
        bonificaciones = ?, 
        deducciones = ?, 
        estado = ?, 
        metodo_pago = ?
      WHERE id = ?
    `;
    await pool.query(query, [
      empleado_id,
      periodo_mes,
      periodo_anio,
      fecha_pago,
      salario_base_pactado,
      bonificaciones || 0.00,
      deducciones || 0.00,
      estado,
      metodo_pago,
      id
    ]);

    res.json({ mensaje: 'Nómina actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar nómina:', error);
    res.status(500).json({ mensaje: 'Error al actualizar la nómina' });
  }
};

// Cambiar el estado de la nómina (Pendiente, Aprobado, Pagado)
const cambiarEstadoNomina = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    await pool.query('UPDATE nominas SET estado = ? WHERE id = ?', [estado, id]);
    res.json({ mensaje: 'Estado de la nómina actualizado' });
  } catch (error) {
    console.error('Error al cambiar estado de la nómina:', error);
    res.status(500).json({ mensaje: 'Error al modificar el estado' });
  }
};

module.exports = {
  obtenerNominas,
  crearNomina,
  actualizarNomina,
  cambiarEstadoNomina
};