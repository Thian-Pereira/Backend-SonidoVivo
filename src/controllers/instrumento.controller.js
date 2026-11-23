// src/controllers/instrumento.controller.js
const pool = require('../db');

const SELECT_COLS = `
  id, nombre, marca, modelo, descripcion, categoria, precio, stock,
  en_oferta AS "enOferta", descuento
`;

async function obtenerInstrumentos(req, res) {
  try {
    const { rows } = await pool.query(`SELECT ${SELECT_COLS} FROM productos ORDER BY id ASC`);
    res.json(rows);
  } catch {
    res.status(500).json({ mensaje: 'Error al obtener productos' });
  }
}

async function obtenerInstrumentoPorId(req, res) {
  try {
    const { rows } = await pool.query(`SELECT ${SELECT_COLS} FROM productos WHERE id = $1`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ mensaje: 'Error al consultar producto' });
  }
}

async function crearInstrumento(req, res) {
  try {
    const { nombre, marca, modelo, descripcion, categoria, precio, stock, enOferta, descuento } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO productos (nombre, marca, modelo, descripcion, categoria, precio, stock, en_oferta, descuento)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING ${SELECT_COLS}`,
      [nombre, marca || '', modelo || '', descripcion || '', categoria || 'General', Number(precio), Number(stock) || 0, Boolean(enOferta), Number(descuento) || 0]
    );
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ mensaje: 'Error al crear producto' });
  }
}

async function actualizarInstrumento(req, res) {
  try {
    const { nombre, marca, modelo, descripcion, categoria, precio, stock, enOferta, descuento } = req.body;
    const { rows } = await pool.query(
      `UPDATE productos
       SET nombre = COALESCE($1, nombre), marca = COALESCE($2, marca), modelo = COALESCE($3, modelo),
           descripcion = COALESCE($4, descripcion), categoria = COALESCE($5, categoria),
           precio = COALESCE($6, precio), stock = COALESCE($7, stock),
           en_oferta = COALESCE($8, en_oferta), descuento = COALESCE($9, descuento)
       WHERE id = $10
       RETURNING ${SELECT_COLS}`,
      [nombre, marca, modelo, descripcion, categoria, precio, stock, enOferta, descuento, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ mensaje: 'Error al actualizar producto' });
  }
}

async function eliminarInstrumento(req, res) {
  try {
    const { rowCount } = await pool.query('DELETE FROM productos WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.status(204).send();
  } catch {
    res.status(500).json({ mensaje: 'Error al eliminar producto' });
  }
}

module.exports = {
  obtenerInstrumentos,
  obtenerInstrumentoPorId,
  crearInstrumento,
  actualizarInstrumento,
  eliminarInstrumento
};