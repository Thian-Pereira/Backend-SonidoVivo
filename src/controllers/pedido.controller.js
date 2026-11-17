const pool = require('../db');

const crearPedido = async (req, res) => {
    // Si aún no tienen el middleware de JWT, usa un ID fijo temporal (ej. 1) para poder probar
    const usuario_id = req.usuario?.id || 1; 
    const { instrumentos } = req.body; 

    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        let totalPedido = 0;

        // 1. Validar el stock de cada instrumento (Regla de Negocio - IE3.1.1)
        for (const item of instrumentos) {
            const resInst = await client.query(
                'SELECT nombre, precio, stock FROM instrumentos WHERE id = $1 FOR UPDATE',
                [item.instrumento_id]
            );

            const instrumento = resInst.rows[0];
            if (!instrumento) {
                throw { status: 404, message: `Instrumento ID ${item.instrumento_id} no encontrado` };
            }

            // Conflicto 409: Supera el stock disponible
            if (item.cantidad > instrumento.stock) {
                throw { 
                    status: 409, 
                    message: `Stock insuficiente para ${instrumento.nombre}. Solicitado: ${item.cantidad}, Disponible: ${instrumento.stock}` 
                };
            }

            totalPedido += parseFloat(instrumento.precio) * item.cantidad;
        }

        // 2. Insertar el Pedido principal
        const resPedido = await client.query(
            "INSERT INTO pedidos (usuario_id, total, estado) VALUES ($1, $2, 'PENDIENTE') RETURNING id",
            [usuario_id, totalPedido]
        );
        const pedidoId = resPedido.rows[0].id;

        // 3. Registrar el detalle y descontar el stock
        for (const item of instrumentos) {
            const resInst = await client.query('SELECT precio FROM instrumentos WHERE id = $1', [item.instrumento_id]);
            const precioUnitario = resInst.rows[0].precio;
            
            await client.query(
                'INSERT INTO detalles_pedido (pedido_id, instrumento_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
                [pedidoId, item.instrumento_id, item.cantidad, precioUnitario]
            );

            await client.query(
                'UPDATE instrumentos SET stock = stock - $1 WHERE id = $2',
                [item.cantidad, item.instrumento_id]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ mensaje: "Pedido creado exitosamente", pedido_id: pedidoId });

    } catch (error) {
        await client.query('ROLLBACK');
        const status = error.status || 500;
        res.status(status).json({ error: error.message || "Error interno del servidor" });
    } finally {
        client.release();
    }
};

const listarPedidos = async (req, res) => {
    try {
        // En el futuro, si el rol es CLIENTE, debes agregar: WHERE usuario_id = req.usuario.id
        const { rows } = await pool.query('SELECT * FROM pedidos ORDER BY fecha DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar pedidos' });
    }
};

const consultarPedido = async (req, res) => {
    const { id } = req.params;
    try {
        const pedidoRes = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);
        if (pedidoRes.rows.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });

        const detallesRes = await pool.query(`
            SELECT d.cantidad, d.precio_unitario, i.nombre 
            FROM detalles_pedido d 
            JOIN instrumentos i ON d.instrumento_id = i.id 
            WHERE d.pedido_id = $1
        `, [id]);

        res.json({
            pedido: pedidoRes.rows[0],
            detalles: detallesRes.rows
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al consultar el pedido' });
    }
};

const actualizarEstado = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        const { rowCount } = await pool.query('UPDATE pedidos SET estado = $1 WHERE id = $2', [estado, id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Pedido no encontrado' });
        
        res.json({ mensaje: 'Estado del pedido actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el estado' });
    }
};

module.exports = { crearPedido, listarPedidos, consultarPedido, actualizarEstado };