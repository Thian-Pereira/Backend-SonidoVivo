const { generarToken, encriptarPassword, compararPassword } = require('./auth.service');
const { validarRegistro } = require('../utils/usuario.validation');

const crearUsuario = async (datos, repositorio) => {
  const errores = validarRegistro(datos);
  if (errores.length > 0) {
    const error = new Error('Datos de registro inválidos');
    error.status = 400;
    error.detalles = errores;
    throw error;
  }

  const usuarioExistente = await repositorio.buscarPorCorreo(datos.correo);
  if (usuarioExistente) {
    const error = new Error('El correo ya está registrado');
    error.status = 409;
    throw error;
  }

  const passwordHash = await encriptarPassword(datos.password);
  const nuevoUsuario = await repositorio.crear({
    nombre: datos.nombre.trim(),
    correo: datos.correo.trim().toLowerCase(),
    password: passwordHash
  });

  return { id: nuevoUsuario.id, nombre: nuevoUsuario.nombre, correo: nuevoUsuario.correo };
};

const iniciarSesion = async (correo, password, repositorio) => {
  if (typeof correo !== 'string' || typeof password !== 'string' || !correo.trim() || !password) {
    const error = new Error('Correo y contraseña son obligatorios');
    error.status = 400;
    throw error;
  }

  const usuario = await repositorio.buscarPorCorreo(correo.trim().toLowerCase());
  if (!usuario) {
    const error = new Error('Credenciales incorrectas');
    error.status = 401;
    throw error;
  }

  const passwordCorrecta = await compararPassword(password, usuario.password);
  if (!passwordCorrecta) {
    const error = new Error('Credenciales incorrectas');
    error.status = 401;
    throw error;
  }

  const token = generarToken(usuario);
  return {
    usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
    token
  };
};

module.exports = { crearUsuario, iniciarSesion };
