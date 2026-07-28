const express = require('express');
const router = express.Router();
const { 
  getEmpleados, 
  crearEmpleado, 
  cambiarEstadoEmpleado,
  actualizarEmpleado // <-- Importamos la nueva función
} = require('../controllers/empleadoController');

router.get('/', getEmpleados);
router.post('/', crearEmpleado);
router.patch('/:id/estado', cambiarEstadoEmpleado);

// 👇 Nueva ruta para editar
router.put('/:id', actualizarEmpleado);

module.exports = router;