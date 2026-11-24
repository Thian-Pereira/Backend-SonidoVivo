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
 *   post:
 *     summary: Crear un nuevo producto (ADMIN)
 *     tags: [Productos]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example: { "nombre": "Pedal Overdrive", "marca": "Boss", "modelo": "SD-1", "descripcion": "Overdrive clásico", "categoria": "Audio", "precio": 79990, "stock": 6, "enOferta": false, "descuento": 0 }
 *     responses:
 *       201: { description: "Producto creado" }
 * /api/productos/{id}:
 *   get:
 *     summary: Obtener detalle de un producto por ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: "Detalle del producto" }
 *   put:
 *     summary: Actualizar producto existente (ADMIN)
 *     tags: [Productos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example: { "precio": 650000, "stock": 8, "enOferta": true, "descuento": 10 }
 *     responses:
 *       200: { description: "Producto actualizado" }
 *   delete:
 *     summary: Eliminar producto del catálogo (ADMIN)
 *     tags: [Productos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: "Producto eliminado" }
 */
router.get('/productos', ctrl.obtenerInstrumentos);
router.get('/productos/:id', ctrl.obtenerInstrumentoPorId);
router.post('/productos', verificarToken, verificarRol('ADMIN'), ctrl.crearInstrumento);
router.put('/productos/:id', verificarToken, verificarRol('ADMIN'), ctrl.actualizarInstrumento);
router.delete('/productos/:id', verificarToken, verificarRol('ADMIN'), ctrl.eliminarInstrumento);

router.get('/instrumentosdb', ctrl.obtenerInstrumentos);
router.post('/instrumentosdb', ctrl.crearInstrumento);

module.exports = router;
