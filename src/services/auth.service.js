
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const obtenerSecreto = () => {
  const secreto = process.env.JWT_SECRET;

  if (!secreto || secreto.length < 32) {
    throw new Error(
      'JWT_SECRET no está configurado o es demasiado corto (mínimo 32 caracteres)'
    );
  }

  return secreto;
};

const generarToken = (usuario) => {
  if (!usuario || !usuario.id || !usuario.correo || !usuario.rol) {
    throw new Error('Datos de usuario incompletos para generar el token');
  }

  return jwt.sign(
    {
      id: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol
    },
    obtenerSecreto(),
    {
      expiresIn: '2h',
      algorithm: 'HS256'
    }
  );
};

const encriptarPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const compararPassword = async (password, passwordHash) => {
  return await bcrypt.compare(password, passwordHash);
};

module.exports = {
  generarToken,
  encriptarPassword,
  compararPassword
};
