const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const verificarToken = require('../middleware/auth.middleware');
const verificarRol = require('../middleware/roles.middleware');

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
 *     summary: Crear usuario con rol específico (ADMIN)
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example: { "nombre": "Vendedor", "email": "vendedor@sonidovivo.cl", "password": "Password123!", "rol": "CLIENTE" }
 *     responses:
 *       201: { description: "Usuario creado" }
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: "Usuario encontrado" }
 *   put:
 *     summary: Actualizar datos, rol o estado de un usuario
 *     tags: [Usuarios]
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
 *           example: { "nombre": "Nombre Editado", "rol": "CLIENTE", "activo": true }
 *     responses:
 *       200: { description: "Usuario actualizado" }
 *   delete:
 *     summary: Desactivar usuario por ID (ADMIN)
 *     tags: [Usuarios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: "Usuario desactivado" }
 */
router.get('/usuarios', verificarToken, verificarRol('ADMIN'), usuarioController.listarUsuarios);
router.post('/usuarios', verificarToken, verificarRol('ADMIN'), usuarioController.crearUsuario);
router.get('/usuarios/:id', verificarToken, usuarioController.obtenerUsuarioPorId);
router.put('/usuarios/:id', verificarToken, usuarioController.actualizarUsuario);
router.delete('/usuarios/:id', verificarToken, verificarRol('ADMIN'), usuarioController.eliminarUsuario);

module.exports = router;
