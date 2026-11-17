
const validarRegistro = (datos = {}) => {
  const errores = [];

  const { nombre, correo, password } =
    datos && typeof datos === 'object' ? datos : {};

  if (
    typeof nombre !== 'string' ||
    nombre.trim().length < 2
  ) {
    errores.push('El nombre debe tener al menos 2 caracteres');
  }

  if (
    typeof correo !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())
  ) {
    errores.push('Debes ingresar un correo válido');
  }

  if (
    typeof password !== 'string' ||
    password.length < 8
  ) {
    errores.push('La contraseña debe tener al menos 8 caracteres');
  }

  return errores;
};

module.exports = {
  validarRegistro
};

