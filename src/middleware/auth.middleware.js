
const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const secreto = process.env.JWT_SECRET;

  if (!secreto || secreto.length < 32) {
    return res.status(500).json({
      error: 'Error de configuración del servidor'
    });
  }

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No se proporcionó un token de autenticación'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Formato de token inválido'
      });
    }

    const usuario = jwt.verify(token, secreto, {
      algorithms: ['HS256']
    });

    req.usuario = usuario;

    next();

  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido o expirado'
    });
  }
};

module.exports = verificarToken;

