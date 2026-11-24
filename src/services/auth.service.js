const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generarToken = (usuario) => {
  return jwt.sign(
    { id: usuario.id, correo: usuario.correo, rol: usuario.rol },
    process.env.JWT_SECRET || 'clave_secreta_sonido_vivo_2026',
    { expiresIn: '2h' }
  );
};

const encriptarPassword = async (password) => bcrypt.hash(password, 10);
const compararPassword = async (password, passwordHash) => bcrypt.compare(password, passwordHash);

module.exports = { generarToken, encriptarPassword, compararPassword };
