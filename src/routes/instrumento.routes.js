const express = require('express');
const router = express.Router();
const instrumentoController = require('../controllers/instrumento.controller');

router.post('/instrumentosdb', instrumentoController.crearInstrumento);
router.get('/instrumentosdb', instrumentoController.obtenerInstrumentos);

module.exports = router;