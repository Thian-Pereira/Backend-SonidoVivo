
const { test } = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = 'clave-secreta-para-pruebas';

const {
  crearUsuario,
  iniciarSesion
} = require('../src/services/usuario.service');

const usuarios = [];

const repositorio = {
  async buscarPorCorreo(correo) {
    return usuarios.find(usuario => usuario.correo === correo) || null;
  },

  async crear(datos) {
    const usuario = {
      id: usuarios.length + 1,
      nombre: datos.nombre,
      correo: datos.correo,
      password: datos.password,
      rol: 'cliente'
    };

    usuarios.push(usuario);
    return usuario;
  }
};

test('Debe registrar un usuario y guardar su contraseña cifrada', async () => {
  usuarios.length = 0;

  const resultado = await crearUsuario({
    nombre: 'Thian Pereira',
    correo: 'thian@gmail.com',
    password: '12345678'
  }, repositorio);

  assert.equal(resultado.nombre, 'Thian Pereira');
  assert.equal(resultado.correo, 'thian@gmail.com');
  assert.ok(resultado.id);
  assert.equal(usuarios[0].password === '12345678', false);
});

test('Debe rechazar el registro de un correo existente', async () => {
  usuarios.length = 0;

  await crearUsuario({
    nombre: 'Thian',
    correo: 'thian@gmail.com',
    password: '12345678'
  }, repositorio);

  await assert.rejects(
    crearUsuario({
      nombre: 'Otro usuario',
      correo: 'thian@gmail.com',
      password: '87654321'
    }, repositorio),
    { status: 409 }
  );
});

test('Debe permitir iniciar sesión con credenciales correctas', async () => {
  usuarios.length = 0;

  await crearUsuario({
    nombre: 'Thian',
    correo: 'thian@gmail.com',
    password: '12345678'
  }, repositorio);

  const resultado = await iniciarSesion(
    'thian@gmail.com',
    '12345678',
    repositorio
  );

  assert.ok(resultado.token);
  assert.equal(resultado.usuario.correo, 'thian@gmail.com');
  assert.equal(resultado.usuario.rol, 'cliente');
});

test('Debe rechazar el inicio de sesión con contraseña incorrecta', async () => {
  usuarios.length = 0;

  await crearUsuario({
    nombre: 'Thian',
    correo: 'thian@gmail.com',
    password: '12345678'
  }, repositorio);

  await assert.rejects(
    iniciarSesion('thian@gmail.com', 'contraseña-incorrecta', repositorio),
    { status: 401 }
  );
});
