const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importamos la base de datos para que ejecute su verificación al arrancar
const pool = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Permite peticiones desde el Frontend de React
app.use(express.json()); // Permite procesar peticiones en formato JSON

// Ruta de prueba rápida de la API
app.get('/api/saludo', (req, res) => {
  res.json({ mensaje: '¡Servidor Express funcionando!' });
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});