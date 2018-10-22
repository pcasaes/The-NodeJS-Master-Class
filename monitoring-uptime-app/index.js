/**
 * Primary file for the monitoring uptime app
 *
 **/

// Dependencies
const users = require('./lib/handlers/users');
const httpServer = require('./lib/http-server');
const rest = require('./lib/rest-service');





// Define a request router
const router = {
    'users': users.users,
    'users/{phone}': users.users,
    //'tokens': handlers.tokens,
};


// Start the server
httpServer.start((req, res) => new rest.RestService(router).respond(req, res));