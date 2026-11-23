const bcrypt = require('bcryptjs');
const pool = require('../db');
const usuarioService = require('../services/usuario.service');

const crearUsuario = async (req, res) => {
  if (req.app.locals.usuarioRepository) {
    try {
      const usuario = await usuarioService.crearUsuario(req.body, req.app.locals.usuarioRepository);
      return res.status(201).json({ mensaje: 'Usuario registrado correctamente', usuario });
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message, detalles: error.detalles });
    }
  }

  try {
    const { nombre, email, correo, password, rol } = req.body;
    const emailFinal = (email || correo || '').trim().toLowerCase();
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol, activo) VALUES ($1, $2, $3, $4, TRUE) RETURNING id, nombre, email, rol, activo',
      [nombre.trim(), emailFinal, hash, rol || 'CLIENTE']
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ mensaje: 'El correo ya está registrado' });
    return res.status(500).json({ mensaje: 'Error al crear usuario' });
  }
};

const iniciarSesion = async (req, res) => {
  try {
    const resultado = await usuarioService.iniciarSesion(
      req.body.correo,
      req.body.password,
      req.app.locals.usuarioRepository
    );
    return res.status(200).json({ mensaje: 'Inicio de sesión exitoso', ...resultado });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
};

const obtenerPerfil = (req, res) => res.status(200).json({ usuario: req.usuario });

const listarUsuarios = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, nombre, email, rol, activo, created_at AS "createdAt" FROM usuarios ORDER BY id ASC'
    );
    res.json(rows);
  } catch {
    res.status(500).json({ mensaje: 'Error al listar usuarios' });
  }
};

const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = $1',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ mensaje: 'Error al consultar usuario' });
  }
};

const actualizarUsuario = async (req, res) => {
  try {
    const { nombre, email, rol, activo } = req.body;
    const { rows } = await pool.query(
      `UPDATE usuarios
       SET nombre = COALESCE($1, nombre),
           email = COALESCE($2, email),
           rol = COALESCE($3, rol),
           activo = COALESCE($4, activo)
       WHERE id = $5
       RETURNING id, nombre, email, rol, activo`,
      [nombre, email?.trim().toLowerCase(), rol, activo, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ mensaje: 'Error al actualizar usuario' });
  }
};

const eliminarUsuario = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE usuarios SET activo = FALSE WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario desactivado', id: rows[0].id });
  } catch {
    res.status(500).json({ mensaje: 'Error al desactivar usuario' });
  }
};

module.exports = {
  crearUsuario,
  iniciarSesion,
  obtenerPerfil,
  listarUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario
};