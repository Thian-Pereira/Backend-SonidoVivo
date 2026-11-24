
const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  encriptarPassword,
  compararPassword
} = require('../src/services/auth.service');

test('Debe cifrar una contraseña', async () => {
  const password = '12345678';
  const hash = await encriptarPassword(password);

  assert.notEqual(hash, password);
  assert.ok(hash.length > 0);
});

test('Debe reconocer una contraseña correcta', async () => {
  const password = '12345678';
  const hash = await encriptarPassword(password);

  const resultado = await compararPassword(password, hash);

  assert.equal(resultado, true);
});

test('Debe rechazar una contraseña incorrecta', async () => {
  const hash = await encriptarPassword('12345678');

  const resultado = await compararPassword('otra-clave', hash);

  assert.equal(resultado, false);
});
