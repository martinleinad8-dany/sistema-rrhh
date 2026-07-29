const express = require('express');
const router = express.Router();
const {
  obtenerNominas,
  crearNomina,
  actualizarNomina,
  cambiarEstadoNomina
} = require('../controllers/nominaController');

router.get('/', obtenerNominas);
router.post('/', crearNomina);
router.put('/:id', actualizarNomina);
router.patch('/:id/estado', cambiarEstadoNomina);

module.exports = router;