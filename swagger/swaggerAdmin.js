const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const adminSwaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Admin API',
      version: '1.0.0',
      description: 'Admin authentication APIs',
    },
    servers: [{ url: 'http://localhost:5001' }],
  },
  apis: ['./routes/authRoutes.js'], // Admin API routes
};

const adminSwaggerSpec = swaggerJsdoc(adminSwaggerOptions);

function setupSwaggerAdmin(app) {
  // Use a unique instance of swaggerUi
  app.use(
    '/api-docs/admin',
    swaggerUi.serveFiles(adminSwaggerSpec, {}),
    swaggerUi.setup(adminSwaggerSpec, { explorer: true })
  );
}

module.exports = setupSwaggerAdmin;
