const app = require('./src/app');
const http = require('http');

const server = http.createServer(app);
server.listen(0, async () => {
  const port = server.address().port;
  const res = await fetch(`http://localhost:${port}/api/saludo?nombre=Ana`);
  const data = await res.json();
  console.log("¡RESPUESTA DE LA API EXITOSA!");
  console.log(data);
  server.close();
});
