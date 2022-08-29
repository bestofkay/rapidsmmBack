const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    version: '',      // by default: '1.0.0'
    title: '',        // by default: 'REST API'
    description: '',  // by default: ''
  },
  host: '',      // by default: 'localhost:3000'
  basePath: '',  // by default: '/'
  schemes: [],   // by default: ['http']
  consumes: [],  // by default: ['application/json']
  produces: [],  // by default: ['application/json']
  tags: [        // by default: empty Array
    {
      name: '',         // Tag name
      description: '',  // Tag description
    },
    // { ... }
  ],
  securityDefinitions: {
    apiKeyAuth: {
      type: 'apiKey',
      in: 'header', // can be 'header', 'query' or 'cookie'
      name: 'X-API-KEY', // name of the header, query parameter or cookie
      description: 'Some description...'
    }
  }, // by default: empty object         // by default: empty object (Swagger 2.0)
  components: {}            // by default: empty object (OpenAPI 3.x)
};

const outputFile = './path/swagger-output.json';
const endpointsFiles = ['./routes/*.js'];

/* NOTE: if you use the express Router, you must pass in the 
   'endpointsFiles' only the root file where the route starts,
   such as: index.js, app.js, routes.js, ... */

   swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    require('./index')           // Your project's root file
})