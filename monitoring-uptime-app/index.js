/**
 * Primary file for the monitoring uptime app
 *
 **/

// Dependencies
const handlers = require('./lib/handlers');
const httpServer = require('./lib/http-server');
const rest = require('./lib/rest-service');





// Define a request router
const router = {
    '^users(/(\\d{10}))?$': handlers.users,
};


// Start the server
httpServer.start((req, res) => new rest.RestService(router, handlers.notFound).respond(req, res));