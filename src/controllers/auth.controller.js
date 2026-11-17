const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registrarUsuario = async (req, res) => {
    const { nombre, email, password } = req.body;

    try {
        // Encriptar la contraseña (Hash)
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Guardar en la base de datos asignando el rol CLIENTE por defecto
        const result = await pool.query(
            "INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, 'CLIENTE') RETURNING id, nombre, email, rol",
            [nombre, email, password_hash]
        );

        res.status(201).json({ mensaje: "Usuario registrado con éxito", usuario: result.rows[0] });
    } catch (error) {
        // Si el email ya existe, PostgreSQL arrojará un error de constraint
        res.status(500).json({ error: "Error al registrar el usuario" });
    }
};

const loginUsuario = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar usuario en la tabla
        const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
        
        // Error genérico si no existe
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Credenciales incorrectas" });
        }

        const usuario = result.rows[0];

        // Comprobar el hash
        const validPassword = await bcrypt.compare(password, usuario.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: "Credenciales incorrectas" });
        }

        // Generar JWT
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol }, 
            process.env.JWT_SECRET || 'secreto_super_seguro_temporal', 
            { expiresIn: '2h' }
        );

        res.json({ token, mensaje: "Inicio de sesión exitoso" });
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

module.exports = { registrarUsuario, loginUsuario };