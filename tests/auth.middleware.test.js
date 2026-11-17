
const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'clave-secreta-larga-para-pruebas-unitarias-2026';

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

test('Debe responder 500 cuando JWT_SECRET no está configurado', () => {
  const secretoOriginal = process.env.JWT_SECRET;

  delete process.env.JWT_SECRET;

  const req = { headers: {} };
  const res = crearRespuesta();

  verificarToken(req, res, () => {});

  assert.equal(res.statusCode, 500);

  process.env.JWT_SECRET = secretoOriginal;
});

test('Debe rechazar un encabezado Bearer sin token', () => {
  const req = {
    headers: { authorization: 'Bearer ' }
  };

  const res = crearRespuesta();

  verificarToken(req, res, () => {});

  assert.equal(res.statusCode, 401);
});

test('Debe rechazar un token firmado con HS384', () => {
  const token = jwt.sign(
    { id: 1, correo: 'test@gmail.com', rol: 'administrador' },
    process.env.JWT_SECRET,
    { algorithm: 'HS384' }
  );

  const req = {
    headers: { authorization: `Bearer ${token}` }
  };

  const res = crearRespuesta();

  verificarToken(req, res, () => {});

  assert.equal(res.statusCode, 401);
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

test('Debe responder 500 cuando no se configuran roles permitidos', () => {
  const req = {
    usuario: { id: 1, rol: 'administrador' }
  };

  const res = crearRespuesta();

  verificarRol()(req, res, () => {});

  assert.equal(res.statusCode, 500);
});

test('Debe responder 500 cuando se configura un rol inválido', () => {
  const req = {
    usuario: { id: 1, rol: 'administrador' }
  };

  const res = crearRespuesta();

  verificarRol(123)(req, res, () => {});

  assert.equal(res.statusCode, 500);
});

test('Debe rechazar un usuario cuyo rol no es un texto válido', () => {
  const req = {
    usuario: { id: 1, rol: 123 }
  };

  const res = crearRespuesta();

  verificarRol('administrador')(req, res, () => {});

  assert.equal(res.statusCode, 403);
});
