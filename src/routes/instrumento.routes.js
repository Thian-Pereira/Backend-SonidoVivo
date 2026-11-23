// src/routes/instrumento.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/instrumento.controller');
const verificarToken = require('../middleware/auth.middleware');
const verificarRol = require('../middleware/roles.middleware');

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Listar catálogo completo de productos
 *     tags: [Productos]
 *     responses:
 *       200: { description: "Lista de productos" }
 */
router.get('/productos', ctrl.obtenerInstrumentos);
router.get('/productos/:id', ctrl.obtenerInstrumentoPorId);
router.post('/productos', verificarToken, verificarRol('ADMIN'), ctrl.crearInstrumento);
router.put('/productos/:id', verificarToken, verificarRol('ADMIN'), ctrl.actualizarInstrumento);
router.delete('/productos/:id', verificarToken, verificarRol('ADMIN'), ctrl.eliminarInstrumento);

// Alias heredado
router.get('/instrumentosdb', ctrl.obtenerInstrumentos);
router.post('/instrumentosdb', ctrl.crearInstrumento);

module.exports = router;