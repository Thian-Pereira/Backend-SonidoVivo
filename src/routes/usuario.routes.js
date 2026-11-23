const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const verificarToken = require('../middleware/auth.middleware');
const verificarRol = require('../middleware/roles.middleware');

// Rutas usadas por los tests unitarios existentes
router.post('/usuarios/registro', usuarioController.crearUsuario);
router.post('/usuarios/login', usuarioController.iniciarSesion);
router.get('/usuarios/perfil', verificarToken, usuarioController.obtenerPerfil);

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Listar todos los usuarios (ADMIN)
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: "Lista de usuarios" }
 *   post:
 *     summary: Crear usuario (ADMIN)
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: "Usuario creado" }
 */
router.get('/usuarios', verificarToken, verificarRol('ADMIN'), usuarioController.listarUsuarios);
router.post('/usuarios', verificarToken, verificarRol('ADMIN'), usuarioController.crearUsuario);
router.get('/usuarios/:id', verificarToken, usuarioController.obtenerUsuarioPorId);
router.put('/usuarios/:id', verificarToken, usuarioController.actualizarUsuario);
router.delete('/usuarios/:id', verificarToken, verificarRol('ADMIN'), usuarioController.eliminarUsuario);

module.exports = router;