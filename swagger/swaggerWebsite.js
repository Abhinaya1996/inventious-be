const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const websiteSwaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Website User API',
      version: '1.0.0',
      description: 'Website user registration and authentication APIs',
    },
    servers: [{ url: 'https://api.inventious.co' }],
  },
  apis: ['./routes/websiteAuthRoutes.js'], // Website API routes
};

const websiteSwaggerSpec = swaggerJsdoc(websiteSwaggerOptions);

function setupSwaggerWebsite(app) {
  app.use(
    '/api-docs/website',
    swaggerUi.serveFiles(websiteSwaggerSpec, {}),
    swaggerUi.setup(websiteSwaggerSpec, { explorer: true })
  );
}

module.exports = setupSwaggerWebsite;
