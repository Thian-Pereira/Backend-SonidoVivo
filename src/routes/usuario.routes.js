
const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuario.controller');
const verificarToken = require('../middleware/auth.middleware');

router.post('/usuarios/registro', usuarioController.crearUsuario);

router.post('/usuarios/login', usuarioController.iniciarSesion);

router.get('/usuarios/perfil', verificarToken, usuarioController.obtenerPerfil);

module.exports = router;
