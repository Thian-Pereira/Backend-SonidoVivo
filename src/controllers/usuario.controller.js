
const usuarioService = require('../services/usuario.service');

const crearUsuario = async (req, res) => {
  try {
    const usuario = await usuarioService.crearUsuario(
      req.body,
      req.app.locals.usuarioRepository
    );

    return res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuario
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message,
      detalles: error.detalles || undefined
    });
  }
};

const iniciarSesion = async (req, res) => {
  try {
    const resultado = await usuarioService.iniciarSesion(
      req.body.correo,
      req.body.password,
      req.app.locals.usuarioRepository
    );

    return res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      ...resultado
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message
    });
  }
};

const obtenerPerfil = (req, res) => {
  return res.status(200).json({
    usuario: req.usuario
  });
};

module.exports = {
  crearUsuario,
  iniciarSesion,
  obtenerPerfil
};
