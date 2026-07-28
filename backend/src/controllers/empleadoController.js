const db = require('../config/database');

// 1. Obtener todos los empleados
const getEmpleados = async (req, res) => {
  try {
    const query = `
      SELECT 
        id, 
        rut_dni,
        nombres,
        apellidos,
        CONCAT(nombres, ' ', apellidos) AS nombre,
        cargo AS puesto,
        departamento,
        COALESCE(email_corporativo, email_personal) AS email,
        IF(estado = 'Activo', 1, 0) AS activo,
        estado
      FROM empleados 
      ORDER BY id DESC
    `;

    const [empleados] = await db.query(query);
    res.json(empleados);
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ mensaje: 'Error al consultar la base de datos' });
  }
};

// 2. Crear un nuevo empleado
const crearEmpleado = async (req, res) => {
  try {
    const { rut_dni, nombres, apellidos, email, departamento, puesto } = req.body;

    if (!nombres || !apellidos || !email || !departamento || !puesto) {
      return res.status(400).json({ mensaje: 'Por favor completa todos los campos obligatorios.' });
    }

    const query = `
      INSERT INTO empleados (rut_dni, nombres, apellidos, email_corporativo, departamento, cargo, estado)
      VALUES (?, ?, ?, ?, ?, ?, 'Activo')
    `;

    const [result] = await db.query(query, [
      rut_dni || null,
      nombres,
      apellidos,
      email,
      departamento,
      puesto
    ]);

    res.status(201).json({
      mensaje: 'Empleado creado exitosamente',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error al crear empleado:', error);
    res.status(500).json({ mensaje: 'Error al registrar el empleado en la base de datos' });
  }
};

// 3. Cambiar el estado de un empleado (Activo <-> Inactivo)
const cambiarEstadoEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado || (estado !== 'Activo' && estado !== 'Inactivo')) {
      return res.status(400).json({ mensaje: 'El estado proporcionado no es válido.' });
    }

    const query = 'UPDATE empleados SET estado = ? WHERE id = ?';
    const [result] = await db.query(query, [estado, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Empleado no encontrado.' });
    }

    res.json({
      mensaje: `Empleado ${estado === 'Activo' ? 'activado' : 'desactivado'} exitosamente.`,
      id,
      estado
    });
  } catch (error) {
    console.error('Error al cambiar el estado del empleado:', error);
    res.status(500).json({ mensaje: 'Error al actualizar el estado en la base de datos' });
  }
};

// 4. Actualizar datos de un empleado (PUT)
const actualizarEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { rut_dni, nombres, apellidos, email, departamento, puesto } = req.body;

    if (!nombres || !apellidos || !email || !departamento || !puesto) {
      return res.status(400).json({ mensaje: 'Por favor completa todos los campos requeridos.' });
    }

    const query = `
      UPDATE empleados 
      SET 
        rut_dni = ?, 
        nombres = ?, 
        apellidos = ?, 
        email_corporativo = ?, 
        departamento = ?, 
        cargo = ?
      WHERE id = ?
    `;

    const [result] = await db.query(query, [
      rut_dni || null,
      nombres,
      apellidos,
      email,
      departamento,
      puesto,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Empleado no encontrado.' });
    }

    res.json({ mensaje: 'Empleado actualizado correctamente.' });
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    res.status(500).json({ mensaje: 'Error al actualizar el empleado en la base de datos' });
  }
};

module.exports = {
  getEmpleados,
  crearEmpleado,
  cambiarEstadoEmpleado,
  actualizarEmpleado
};