const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

  if (!token) {
    return res.status(403).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta_default');
    req.usuario = decoded; // Guardar datos del usuario decodificados en el request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

module.exports = { verificarToken };