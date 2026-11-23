const express = require('express');
const cors = require('cors');
const { swaggerUi, specs } = require('./swagger');

const saludoRoutes = require('./routes/saludo.routes');
const instrumentoRoutes = require('./routes/instrumento.routes');
const pedidoRoutes = require('./routes/pedido.routes');
const authRoutes = require('./routes/auth.routes');
const usuarioRoutes = require('./routes/usuario.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/v1/pedidos', pedidoRoutes);
app.use('/api', saludoRoutes);
app.use('/api', instrumentoRoutes);
app.use('/api', usuarioRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = app;