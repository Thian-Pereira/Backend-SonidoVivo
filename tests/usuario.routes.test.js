
const { test } = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = 'clave-secreta-larga-para-pruebas-unitarias-2026';

const app = require('../src/app');

const usuarios = [];

app.locals.usuarioRepository = {
  async buscarPorCorreo(correo) {
    return usuarios.find(usuario => usuario.correo === correo) || null;
  },

  async crear(datos) {
    const usuario = {
      id: usuarios.length + 1,
      ...datos,
      rol: 'cliente'
    };

    usuarios.push(usuario);
    return usuario;
  }
};

test('Debe probar las rutas HTTP de usuarios', async (t) => {
  usuarios.length = 0;

  const server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));

  t.after(() => new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
  }));

  const url = `http://localhost:${server.address().port}/api/usuarios`;

  await t.test('Debe registrar un usuario', async () => {
    const respuesta = await fetch(`${url}/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Thian Pereira',
        correo: 'thian@gmail.com',
        password: '12345678'
      })
    });

    const datos = await respuesta.json();

    assert.equal(respuesta.status, 201);
    assert.equal(datos.usuario.correo, 'thian@gmail.com');
    assert.equal(datos.usuario.password, undefined);
  });

  await t.test('Debe iniciar sesión y devolver un token', async () => {
    const respuesta = await fetch(`${url}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo: 'thian@gmail.com',
        password: '12345678'
      })
    });

    const datos = await respuesta.json();

    assert.equal(respuesta.status, 200);
    assert.ok(datos.token);
  });

  await t.test('Debe rechazar el perfil sin token', async () => {
    const respuesta = await fetch(`${url}/perfil`);

    assert.equal(respuesta.status, 401);
  });

  await t.test('Debe permitir consultar el perfil con token', async () => {
    const login = await fetch(`${url}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo: 'thian@gmail.com',
        password: '12345678'
      })
    });

    const datosLogin = await login.json();

    const respuesta = await fetch(`${url}/perfil`, {
      headers: {
        Authorization: `Bearer ${datosLogin.token}`
      }
    });

    const datosPerfil = await respuesta.json();

    assert.equal(respuesta.status, 200);
    assert.equal(datosPerfil.usuario.correo, 'thian@gmail.com');
  });
});
