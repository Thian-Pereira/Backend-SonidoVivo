const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Sonido Vivo',
      version: '1.0.0',
      description: 'API RESTful Sonido Vivo — Auth JWT, Usuarios, Productos y Pedidos'
    },
    servers: [{ url: '/' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: [path.join(__dirname, './routes/*.js')]
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
