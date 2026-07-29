const express = require('express');
const router = express.Router();
const { obtenerMétricasDashboard } = require('../controllers/dashboardController');

router.get('/metricas', obtenerMétricasDashboard);

module.exports = router;