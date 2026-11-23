const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario, obtenerPerfil } = require('../controllers/auth.controller');
const verificarToken = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión y obtener token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example: { "email": "admin@sonidovivo.cl", "password": "Admin123!" }
 *     responses:
 *       200: { description: "Token JWT y datos del usuario" }
 */
router.post('/login', loginUsuario);
router.post('/register', registrarUsuario);
router.post('/registro', registrarUsuario);
router.get('/me', verificarToken, obtenerPerfil);

module.exports = router;