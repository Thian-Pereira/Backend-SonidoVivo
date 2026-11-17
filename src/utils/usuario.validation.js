
const validarRegistro = ({ nombre, correo, password }) => {
  const errores = [];

  if (!nombre || nombre.trim().length < 2) {
    errores.push('El nombre debe tener al menos 2 caracteres');
  }

  if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    errores.push('Debes ingresar un correo válido');
  }

  if (!password || password.length < 8) {
    errores.push('La contraseña debe tener al menos 8 caracteres');
  }

  return errores;
};

module.exports = {
  validarRegistro
};
