
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario || typeof req.usuario !== 'object') {
      return res.status(401).json({
        error: 'Debes iniciar sesión para acceder'
      });
    }

    if (
      rolesPermitidos.length === 0 ||
      !rolesPermitidos.every(rol => typeof rol === 'string' && rol.trim())
    ) {
      return res.status(500).json({
        error: 'Configuración de permisos inválida'
      });
    }

    if (
      typeof req.usuario.rol !== 'string' ||
      !rolesPermitidos.includes(req.usuario.rol)
    ) {
      return res.status(403).json({
        error: 'No tienes permisos para realizar esta acción'
      });
    }

    next();
  };
};

module.exports = verificarRol;

