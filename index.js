require('dotenv').config();
const app = require('./src/app');
const inicializarBaseDeDatos = require('./src/initDb');

const PORT = process.env.PORT || 8080;

inicializarBaseDeDatos()
  .then(() => {
    console.log('PostgreSQL conectado y tablas verificadas');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API Express lista en http://localhost:${PORT}`);
      console.log(`Swagger disponible en http://localhost:${PORT}/api/docs`);
    });
  })
  .catch((err) => {
    console.error('Error al conectar con PostgreSQL:', err.message);
    process.exit(1);
  });