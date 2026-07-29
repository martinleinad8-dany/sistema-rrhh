const express = require('express');
const router = express.Router();
const {
  obtenerAsistencias,
  crearAsistencia,
  actualizarAsistencia
} = require('../controllers/asistenciaController');

router.get('/', obtenerAsistencias);
router.post('/', crearAsistencia);
router.put('/:id', actualizarAsistencia);

module.exports = router;