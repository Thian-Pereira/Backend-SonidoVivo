
const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'clave-secreta-para-pruebas';

const verificarToken = require('../src/middleware/auth.middleware');
const verificarRol = require('../src/middleware/roles.middleware');

const crearRespuesta = () => ({
  statusCode: 200,
  body: null,

  status(codigo) {
    this.statusCode = codigo;
    return this;
  },

  json(datos) {
    this.body = datos;
    return this;
  }
});

test('Debe rechazar una solicitud sin token', () => {
  const req = { headers: {} };
  const res = crearRespuesta();

  verificarToken(req, res, () => {});

  assert.equal(res.statusCode, 401);
});

test('Debe rechazar un token inválido', () => {
  const req = {
    headers: { authorization: 'Bearer token-invalido' }
  };

  const res = crearRespuesta();

  verificarToken(req, res, () => {});

  assert.equal(res.statusCode, 401);
});

test('Debe aceptar un token válido', () => {
  const token = jwt.sign(
    { id: 1, correo: 'test@gmail.com', rol: 'administrador' },
    process.env.JWT_SECRET
  );

  const req = {
    headers: { authorization: `Bearer ${token}` }
  };

  const res = crearRespuesta();
  let siguiente = false;

  verificarToken(req, res, () => {
    siguiente = true;
  });

  assert.equal(siguiente, true);
  assert.equal(req.usuario.rol, 'administrador');
});

test('Debe rechazar el acceso cuando no existe usuario autenticado', () => {
  const req = {};
  const res = crearRespuesta();

  verificarRol('administrador')(req, res, () => {});

  assert.equal(res.statusCode, 401);
});

test('Debe rechazar a un cliente en una ruta de administrador', () => {
  const req = {
    usuario: { id: 2, rol: 'cliente' }
  };

  const res = crearRespuesta();

  verificarRol('administrador')(req, res, () => {});

  assert.equal(res.statusCode, 403);
});

test('Debe permitir el acceso a un administrador', () => {
  const req = {
    usuario: { id: 1, rol: 'administrador' }
  };

  const res = crearRespuesta();
  let siguiente = false;

  verificarRol('administrador')(req, res, () => {
    siguiente = true;
  });

  assert.equal(siguiente, true);
});
