const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const empleadoRoutes = require('./routes/empleadoRoutes');
const contratoRoutes = require('./routes/contratoRoutes');
const nominaRoutes = require('./routes/nominaRoutes');
const asistenciaRoutes = require('./routes/asistenciaRoutes');
const permisoRoutes = require('./routes/permisoRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const desempenoRoutes = require('./routes/desempenoRoutes'); // Importamos desempeño

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/empleados', empleadoRoutes);
app.use('/api/contratos', contratoRoutes);
app.use('/api/nominas', nominaRoutes);
app.use('/api/asistencias', asistenciaRoutes);
app.use('/api/permisos', permisoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/desempeno', desempenoRoutes); // Registramos el endpoint de desempeño

// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;