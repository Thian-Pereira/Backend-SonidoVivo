const pool = require('../db');

const formatearPedido = (p, productos = []) => ({
  id: p.id,
  numeroPedido: p.numero_pedido,
  fecha: p.fecha,
  usuarioEmail: p.usuario_email,
  cliente: {
    nombre: p.cliente_nombre,
    apellido: '',
    correo: p.usuario_email,
    telefono: p.cliente_telefono
  },
  tipoEntrega: p.tipo_entrega,
  direccion: p.direccion,
  metodoPago: p.metodo_pago,
  estadoPago: p.estado_pago,
  subtotal: p.subtotal,
  costoDespacho: p.costo_despacho,
  total: p.total,
  estado: p.estado,
  productos
});

const crearPedido = async (req, res) => {
  const usuarioId = req.usuario.id || req.usuario.sub;
  const usuarioEmail = req.usuario.email || req.usuario.correo;
  const { numeroPedido, cliente, tipoEntrega, direccion, metodoPago, productos } = req.body;

  if (!Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ mensaje: 'El pedido debe incluir al menos un producto' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let subtotal = 0;
    const detalles = [];

    for (const item of productos) {
      const prodId = item.id || item.productoId || item.instrumento_id;
      const { rows } = await client.query(
        'SELECT id, nombre, precio, stock, en_oferta, descuento FROM productos WHERE id = $1 FOR UPDATE',
        [prodId]
      );
      const prod = rows[0];
      if (!prod) throw { status: 404, message: `Producto ID ${prodId} no encontrado` };

      const cantidad = Number(item.cantidad) || 1;
      if (prod.stock < cantidad) {
        throw { status: 409, message: `Stock insuficiente para ${prod.nombre}` };
      }

      const precioFinal = prod.en_oferta
        ? Math.round(prod.precio * (1 - prod.descuento / 100))
        : prod.precio;

      await client.query('UPDATE productos SET stock = stock - $1 WHERE id = $2', [cantidad, prod.id]);

      const subItem = precioFinal * cantidad;
      subtotal += subItem;
      detalles.push({
        productoId: prod.id,
        nombre: prod.nombre,
        precio: precioFinal,
        cantidad,
        subtotal: subItem
      });
    }

    const entrega = tipoEntrega === 'despacho' ? 'despacho' : 'retiro';
    const costoDespacho = entrega === 'despacho' ? Math.round(subtotal * 0.1) : 0;
    const estadoPago =
      entrega === 'retiro' && metodoPago === 'Pago en efectivo en tienda'
        ? 'Pago pendiente'
        : 'Pago realizado';
    const nombreCliente = `${cliente?.nombre || ''} ${cliente?.apellido || ''}`.trim() || usuarioEmail;
    const numPedido = numeroPedido || `SV-${Date.now()}`;

    const resPedido = await client.query(
      `INSERT INTO pedidos (
        numero_pedido, usuario_id, usuario_email, cliente_nombre, cliente_telefono,
        tipo_entrega, direccion, metodo_pago, estado_pago, subtotal, costo_despacho, total, estado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'En preparación')
      RETURNING *`,
      [
        numPedido,
        usuarioId,
        usuarioEmail,
        nombreCliente,
        cliente?.telefono || '',
        entrega,
        entrega === 'despacho' ? String(direccion || '') : '',
        metodoPago || 'Transferencia',
        estadoPago,
        subtotal,
        costoDespacho,
        subtotal + costoDespacho
      ]
    );

    const pedidoCreado = resPedido.rows[0];
    for (const det of detalles) {
      await client.query(
        `INSERT INTO detalles_pedido (pedido_id, producto_id, nombre, precio, cantidad, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [pedidoCreado.id, det.productoId, det.nombre, det.precio, det.cantidad, det.subtotal]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(formatearPedido(pedidoCreado, detalles));
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(error.status || 500).json({ mensaje: error.message || 'Error al crear pedido' });
  } finally {
    client.release();
  }
};

const listarPedidos = async (req, res) => {
  try {
    const usuarioId = req.usuario.id || req.usuario.sub;
    const query =
      req.usuario.rol === 'ADMIN'
        ? 'SELECT * FROM pedidos ORDER BY fecha DESC'
        : 'SELECT * FROM pedidos WHERE usuario_id = $1 ORDER BY fecha DESC';
    const params = req.usuario.rol === 'ADMIN' ? [] : [usuarioId];

    const { rows: pedidos } = await pool.query(query, params);
    const resultado = [];

    for (const p of pedidos) {
      const { rows: prods } = await pool.query(
        'SELECT producto_id AS "productoId", nombre, precio, cantidad, subtotal FROM detalles_pedido WHERE pedido_id = $1',
        [p.id]
      );
      resultado.push(formatearPedido(p, prods));
    }

    res.json(resultado);
  } catch {
    res.status(500).json({ mensaje: 'Error al listar pedidos' });
  }
};

const actualizarPedido = async (req, res) => {
  const { numeroPedido } = req.params;
  const { estado, estadoPago } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE pedidos
       SET estado = COALESCE($1, estado),
           estado_pago = COALESCE($2, estado_pago)
       WHERE numero_pedido = $3 OR id::text = $3
       RETURNING *`,
      [estado, estadoPago, numeroPedido]
    );
    if (rows.length === 0) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    res.json(formatearPedido(rows[0]));
  } catch {
    res.status(500).json({ mensaje: 'Error al actualizar pedido' });
  }
};

module.exports = { crearPedido, listarPedidos, actualizarPedido };