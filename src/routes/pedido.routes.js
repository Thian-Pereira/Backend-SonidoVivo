const express = require('express');
const router = express.Router();
const pool = require('../db');
const { crearPedido, listarPedidos, actualizarPedido } = require('../controllers/pedido.controller');
const verificarToken = require('../middleware/auth.middleware');
const verificarRol = require('../middleware/roles.middleware');

const eliminarPedido = async (req, res) => {
  const { numeroPedido } = req.params;
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM pedidos WHERE numero_pedido = $1 OR id::text = $1',
      [numeroPedido]
    );
    if (rowCount === 0) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    res.status(204).send();
  } catch {
    res.status(500).json({ mensaje: 'Error al eliminar pedido' });
  }
};

/**
 * @swagger
 * /api/pedidos:
 *   get:
 *     summary: Listar pedidos (propios para CLIENTE, todos para ADMIN)
 *     tags: [Pedidos]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: "Lista de pedidos" }
 *   post:
 *     summary: Crear pedido y descontar stock
 *     tags: [Pedidos]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example: { "tipoEntrega": "retiro", "metodoPago": "Transferencia", "productos": [{ "id": 1, "cantidad": 1 }] }
 *     responses:
 *       201: { description: "Pedido creado" }
 * /api/pedidos/{numeroPedido}:
 *   patch:
 *     summary: Actualizar estado o pago de un pedido (ADMIN)
 *     tags: [Pedidos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: numeroPedido
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example: { "estado": "Entregado", "estadoPago": "Pago realizado" }
 *     responses:
 *       200: { description: "Pedido actualizado" }
 *   delete:
 *     summary: Eliminar un pedido por ID o número (ADMIN)
 *     tags: [Pedidos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: numeroPedido
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: "Pedido eliminado" }
 */
router.get('/', verificarToken, listarPedidos);
router.post('/', verificarToken, crearPedido);
router.patch('/:numeroPedido', verificarToken, verificarRol('ADMIN'), actualizarPedido);
router.delete('/:numeroPedido', verificarToken, verificarRol('ADMIN'), eliminarPedido);

module.exports = router;
