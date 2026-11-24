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
 *       401: { description: "Credenciales incorrectas" }
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo cliente
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example: { "nombre": "Nuevo Cliente", "email": "nuevo@sonidovivo.cl", "password": "Password123!" }
 *     responses:
 *       201: { description: "Usuario registrado" }
 * /api/auth/me:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: "Datos del perfil actual" }
 */
router.post('/login', loginUsuario);
router.post('/register', registrarUsuario);
router.post('/registro', registrarUsuario);
router.get('/me', verificarToken, obtenerPerfil);

module.exports = router;