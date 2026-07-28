const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/database'); // Tu conexión a la base de datos

// Controlador para inicio de sesión
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Validar que vengan los campos requeridos
    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor, ingrese correo y contraseña.' });
    }

    // 2. Buscar al usuario en la base de datos (Ajusta la consulta SQL/Tabla a tu BD)
    // Ejemplo con MySQL / SQL Server:
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    const usuario = rows[0];

    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 3. Verificar contraseña cifrada
    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 4. Generar Token JWT (Expira en 8 horas)
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET || 'clave_secreta_default',
      { expiresIn: '8h' }
    );

    // 5. Responder con los datos del usuario y el token
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

module.exports = {
  login
};