/**
 * Primary file for the monitoring uptime app
 *
 **/

// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;


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

    // Get the query string as na object
    const queryStringObject = parsedUrl.query;

    // Get the HTTP Method
    const method = req.method
        .toUpperCase();

    // Get the headers as an object
    const headers = req.headers;

    // Get the payload, if any
    const decoder = new StringDecoder("utf-8");
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();

        // Send the response
        res.end('Hello World!\n');

        // Log the request
        console.log(`${requestTime.toISOString()} Request received: ${method} ${path}
    Query string parameters:`, queryStringObject);
        console.log('    Headers:', headers);
        console.log('    Payload:', buffer);

    });

});

// Start the server, and have it listen to port 3000.
server.listen(3000, () => {
    console.log('The server is listening on port 3000 now.');
});