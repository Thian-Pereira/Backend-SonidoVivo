const express = require('express');
const cors = require('cors');
const saludoRoutes = require('./routes/saludo.routes');
const instrumentoRoutes = require('./routes/instrumento.routes');

const app = express();

app.use(cors()); 
app.use(express.json());

app.use('/api', saludoRoutes);
app.use('/api', instrumentoRoutes);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

module.exports = app;