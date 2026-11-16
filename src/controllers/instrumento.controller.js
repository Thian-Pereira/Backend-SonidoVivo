const pool = require('../db');

async function crearInstrumento(req, res) {
  try {
    const { codigo, categoria, nombre, marca, modelo, stock, precio, descripcion } = req.body;

    if (!nombre || !precio) {
      return res.status(400).json({ error: 'El nombre y el precio son obligatorios' });
    }

    const query = `
      INSERT INTO instrumentos (codigo, categoria, nombre, marca, modelo, stock, precio, descripcion)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const values = [codigo, categoria, nombre, marca, modelo, stock, precio, descripcion];
    const resultado = await pool.query(query, values);

    res.status(201).json({
      mensaje: 'Instrumento guardado correctamente',
      datos: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error al crear instrumento:', error);
    res.status(500).json({ error: 'Error al guardar instrumento en la base de datos' });
  }
}

async function obtenerInstrumentos(req, res) {
  try {
    const resultado = await pool.query('SELECT * FROM instrumentos');
    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener instrumentos:', error);
    res.status(500).json({ error: 'Error al guardar instrumento en la base de datos' });
  }
}

module.exports = { crearInstrumento, obtenerInstrumentos };