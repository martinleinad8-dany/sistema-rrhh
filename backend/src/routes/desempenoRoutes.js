const express = require('express');
const router = express.Router();
const {
  obtenerEvaluaciones,
  crearEvaluacion,
  eliminarEvaluacion
} = require('../controllers/desempenoController');

router.get('/', obtenerEvaluaciones);
router.post('/', crearEvaluacion);
router.delete('/:id', eliminarEvaluacion);

module.exports = router;