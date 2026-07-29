const express = require('express');
const router = express.Router();
const {
  obtenerPermisos,
  crearPermiso,
  actualizarPermiso,
  cambiarEstadoPermiso
} = require('../controllers/permisoController');

router.get('/', obtenerPermisos);
router.post('/', crearPermiso);
router.put('/:id', actualizarPermiso);
router.patch('/:id/estado', cambiarEstadoPermiso);

module.exports = router;