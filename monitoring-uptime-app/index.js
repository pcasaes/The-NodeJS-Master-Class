/**
 * Primary file for the monitoring uptime app
 *
 **/

// Dependencies
const users = require('./lib/handlers/users');
const authentication = require('./lib/handlers/authentication');
const httpServer = require('./lib/http-server');
const rest = require('./lib/rest-service');





// Define a request router
const router = {
    'users': users.users,
    'users/{phone}': users.users,
    'tokens': authentication.tokens,
    'tokens/{id}': authentication.tokens,
};


// Start the server
httpServer.start((req, res) => new rest.RestService(router).respond(req, res));