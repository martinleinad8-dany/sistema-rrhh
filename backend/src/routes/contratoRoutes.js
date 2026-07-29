const express = require('express');
const router = express.Router();
const {
  obtenerContratos,
  crearContrato,
  actualizarContrato,
  cambiarEstadoContrato
} = require('../controllers/contratoController');

router.get('/', obtenerContratos);
router.post('/', crearContrato);
router.put('/:id', actualizarContrato);
router.patch('/:id/estado', cambiarEstadoContrato);

module.exports = router;