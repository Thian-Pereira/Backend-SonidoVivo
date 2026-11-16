function obtenerSaludo(req, res) {
  const nombre = String(req.query.nombre || 'cliente').slice(0, 60);

  res.status(200).json({
    mensaje: `Hola, ${nombre}`,
    backend: 'Node.js + Express en EC2',
    lenguaje: 'Node.js'
  });
}

module.exports = { obtenerSaludo };