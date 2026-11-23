const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registrarUsuario = async (req, res) => {
  const { nombre, email, correo, password } = req.body;
  const emailFinal = (email || correo || '').trim().toLowerCase();

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO usuarios (nombre, email, password_hash, rol, activo) VALUES ($1, $2, $3, 'CLIENTE', TRUE) RETURNING id, nombre, email, rol, activo",
      [nombre?.trim(), emailFinal, password_hash]
    );
    res.status(201).json({ mensaje: 'Usuario registrado con éxito', usuario: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ mensaje: 'El correo ya está registrado' });
    }
    res.status(500).json({ mensaje: 'Error al registrar el usuario' });
  }
};

const loginUsuario = async (req, res) => {
  const { email, correo, password } = req.body;
  const emailFinal = (email || correo || '').trim().toLowerCase();

  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1 AND activo = TRUE',
      [emailFinal]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    const usuario = result.rows[0];
    const validPassword = await bcrypt.compare(password, usuario.password_hash);
    if (!validPassword) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: usuario.id, sub: usuario.id, email: usuario.email, correo: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET || 'clave_secreta_sonido_vivo_2026',
      { expiresIn: '8h' }
    );

    res.json({
      token,
      tipo: 'Bearer',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        activo: usuario.activo
      }
    });
  } catch {
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

const obtenerPerfil = async (req, res) => {
  try {
    const id = req.usuario.id || req.usuario.sub;
    const { rows } = await pool.query(
      'SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = $1 AND activo = TRUE',
      [id]
    );
    if (rows.length === 0) return res.status(401).json({ mensaje: 'Sesión no válida' });
    res.json({ usuario: rows[0] });
  } catch {
    res.status(500).json({ mensaje: 'Error al obtener perfil' });
  }
};

module.exports = { registrarUsuario, loginUsuario, obtenerPerfil };