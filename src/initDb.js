const bcrypt = require('bcryptjs');
const pool = require('./db');

async function inicializarBaseDeDatos() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      rol VARCHAR(20) NOT NULL DEFAULT 'CLIENTE',
      activo BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS productos (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(120) NOT NULL,
      marca VARCHAR(60) NOT NULL DEFAULT '',
      modelo VARCHAR(80) NOT NULL DEFAULT '',
      descripcion VARCHAR(300) NOT NULL DEFAULT '',
      categoria VARCHAR(50) NOT NULL DEFAULT 'General',
      precio INTEGER NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      en_oferta BOOLEAN NOT NULL DEFAULT FALSE,
      descuento INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS pedidos (
      id SERIAL PRIMARY KEY,
      numero_pedido VARCHAR(40) UNIQUE NOT NULL,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
      usuario_email VARCHAR(150) NOT NULL,
      cliente_nombre VARCHAR(120) NOT NULL,
      cliente_telefono VARCHAR(30) NOT NULL DEFAULT '',
      tipo_entrega VARCHAR(20) NOT NULL DEFAULT 'retiro',
      direccion VARCHAR(200) NOT NULL DEFAULT '',
      metodo_pago VARCHAR(80) NOT NULL,
      estado_pago VARCHAR(30) NOT NULL DEFAULT 'Pago realizado',
      subtotal INTEGER NOT NULL,
      costo_despacho INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL,
      estado VARCHAR(30) NOT NULL DEFAULT 'En preparación',
      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS detalles_pedido (
      id SERIAL PRIMARY KEY,
      pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
      producto_id INTEGER NOT NULL REFERENCES productos(id),
      nombre VARCHAR(120) NOT NULL,
      precio INTEGER NOT NULL,
      cantidad INTEGER NOT NULL,
      subtotal INTEGER NOT NULL
    );
  `);

  const { rows: admins } = await pool.query(
    'SELECT id FROM usuarios WHERE email = $1',
    ['admin@sonidovivo.cl']
  );
  if (admins.length === 0) {
    const hashAdmin = await bcrypt.hash('Admin123!', 10);
    await pool.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, $4)',
      ['Administrador Sonido Vivo', 'admin@sonidovivo.cl', hashAdmin, 'ADMIN']
    );
  }

  const { rows: clientes } = await pool.query(
    'SELECT id FROM usuarios WHERE email = $1',
    ['cliente@sonidovivo.cl']
  );
  if (clientes.length === 0) {
    const hashCliente = await bcrypt.hash('Cliente123!', 10);
    await pool.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, $4)',
      ['Cliente Demo', 'cliente@sonidovivo.cl', hashCliente, 'CLIENTE']
    );
  }

  const { rows: prods } = await pool.query('SELECT COUNT(*)::int AS total FROM productos');
  if (prods[0].total === 0) {
    await pool.query(`
      INSERT INTO productos (nombre, marca, modelo, descripcion, categoria, precio, stock, en_oferta, descuento)
      VALUES
        ('Guitarra Eléctrica Stratocaster', 'Fender', 'Player Strat', 'Cuerpo de aliso y tres cápsulas single-coil.', 'Guitarras', 699990, 5, TRUE, 10),
        ('Guitarra Electroacústica Dreadnought', 'Yamaha', 'FGX800C', 'Tapa sólida de abeto con preamplificador.', 'Guitarras', 389990, 6, FALSE, 0),
        ('Bajo Eléctrico Jazz Bass', 'Squier', 'Classic Vibe 70s', 'Sonido versátil de 4 cuerdas.', 'Bajos', 459990, 4, FALSE, 0),
        ('Teclado Sintetizador 61 Teclas', 'Roland', 'JUNO-DS61', 'Sintetizador portátil profesional.', 'Teclados', 789990, 3, TRUE, 15),
        ('Batería Acústica 5 Piezas', 'Pearl', 'Export EXX', 'Cascos de álamo y caoba con hardware.', 'Baterías', 849990, 2, FALSE, 0),
        ('Interfaz de Audio USB 2x2', 'Focusrite', 'Scarlett 2i2 4th Gen', 'Preamplificadores de ultra bajo ruido.', 'Audio', 189990, 8, FALSE, 0)
    `);
  }
}

module.exports = inicializarBaseDeDatos;