/**
 * Primary file for the monitoring uptime app
 *
 **/

// Dependencies
const http = require('http');
const url = require('url');


// The server should respond to all requests with a string.
const server = http.createServer((req, res) => {
    // Get request time
    const requestTime = new Date();

    // Get the URL and parse it.
    const parsedUrl = url.parse(req.url, true);


    // Get the path
    const path = parsedUrl
        .pathname
        .replace(/^\/+|\/+$/g, '');

    // Get the HTTP Method
    const method = req.method
        .toUpperCase();

    // Send the response
    res.end('Hello World!\n');

    // Log the request
    console.log(`${requestTime.toISOString()} Request received: ${method} ${path}`);
});

// Start the server, and have it listen to port 3000.
server.listen(3000, () => {
    console.log('The server is listening on port 3000 now.');
});