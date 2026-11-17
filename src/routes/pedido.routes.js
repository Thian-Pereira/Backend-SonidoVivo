const express = require('express');
const router = express.Router();
const { crearPedido, listarPedidos, consultarPedido, actualizarEstado } = require('../controllers/pedido.controller');


router.post('/', crearPedido);
router.get('/', listarPedidos);
router.get('/:id', consultarPedido);
router.patch('/:id/estado', actualizarEstado);

module.exports = router;