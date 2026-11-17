
const { test } = require('node:test');
const assert = require('node:assert/strict');

const { validarRegistro } = require('../src/utils/usuario.validation');

test('Debe aceptar un registro con datos válidos', () => {
  const errores = validarRegistro({
    nombre: 'Thian Pereira',
    correo: 'thian@gmail.com',
    password: '12345678'
  });

  assert.deepEqual(errores, []);
});

test('Debe rechazar un nombre demasiado corto', () => {
  const errores = validarRegistro({
    nombre: 'T',
    correo: 'thian@gmail.com',
    password: '12345678'
  });

  assert.ok(errores.includes('El nombre debe tener al menos 2 caracteres'));
});

test('Debe rechazar un correo inválido', () => {
  const errores = validarRegistro({
    nombre: 'Thian',
    correo: 'correoIncorrecto',
    password: '12345678'
  });

  assert.ok(errores.includes('Debes ingresar un correo válido'));
});

test('Debe rechazar una contraseña demasiado corta', () => {
  const errores = validarRegistro({
    nombre: 'Thian',
    correo: 'thian@gmail.com',
    password: '123'
  });

  assert.ok(errores.includes('La contraseña debe tener al menos 8 caracteres'));
});

test('Debe rechazar un objeto vacío', () => {
  const errores = validarRegistro({});

  assert.equal(errores.length, 3);
});

test('Debe rechazar datos null', () => {
  const errores = validarRegistro(null);

  assert.equal(errores.length, 3);
});

test('Debe rechazar un nombre que no sea texto', () => {
  const errores = validarRegistro({
    nombre: 123,
    correo: 'thian@gmail.com',
    password: '12345678'
  });

  assert.ok(errores.includes('El nombre debe tener al menos 2 caracteres'));
});

test('Debe rechazar un correo que no sea texto', () => {
  const errores = validarRegistro({
    nombre: 'Thian',
    correo: 123,
    password: '12345678'
  });

  assert.ok(errores.includes('Debes ingresar un correo válido'));
});

test('Debe rechazar una contraseña que no sea texto', () => {
  const errores = validarRegistro({
    nombre: 'Thian',
    correo: 'thian@gmail.com',
    password: 12345678
  });

  assert.ok(errores.includes('La contraseña debe tener al menos 8 caracteres'));
});
