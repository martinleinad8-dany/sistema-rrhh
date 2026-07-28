const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Validar campos
    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor, ingrese correo y contraseña.' });
    }

    // 2. Buscar usuario en la base de datos
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    const usuario = rows[0];

    if (!usuario) {
      console.log('❌ Usuario NO encontrado con el email:', email);
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 🔍 DIAGNÓSTICO EN CONSOLA (Mira tu terminal del backend)
    console.log('------------------------------------');
    console.log('🔑 Password enviada desde React:', password);
    console.log('💾 Password guardada en MySQL:', usuario.password);

    // 3. Comparar contraseña encriptada
    const isMatch = await bcrypt.compare(password, usuario.password);
    console.log('⚡ ¿Coinciden con bcrypt?:', isMatch);
    console.log('------------------------------------');

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 4. Generar Token JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET || 'clave_secreta_default',
      { expiresIn: '8h' }
    );

    // 5. Responder
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
    console.error('Error detallado en el login:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

module.exports = {
  login
};