/**
 * Primary file for the monitoring uptime app
 *
 **/

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const simplerx = require('./simplerx');

// Instantiate the HTTP server
const httpServer = http.createServer((req, res) => unifiedServer(req, res));

// Start the http server, and have it listen to port ${config.httpPort}.
httpServer.listen(config.httpPort, () => {
    console.log(`The http server is listening on port ${config.httpPort} in ${config.envName} mode.`);
});

// Instantiate the HTTPS server
simplerx.Observable
    .fs.exists('./https/key.pem')
    .zip(simplerx.Observable.fs.exists('./https/cert.pem'), (v1, v2) => v1 && v2)
    .error(err => {
        throw err;
    })
    .subscribe((v) => {
        if (v) {
            simplerx.Observable.fs.readFile('./https/key.pem')
                .zip(simplerx.Observable.fs.readFile('./https/cert.pem'), (key, cert) => {
                    return {
                        'key': key,
                        'cert': cert
                    };
                })
                .error(err => {
                    throw err;
                })
                .subscribe((httpsServerOptions) => {

                    const httpsServer = https.createServer(httpsServerOptions, (req, res) => unifiedServer(req, res));

// Start the https server, and have it listen to port ${config.httpsPort}.
                    httpsServer.listen(config.httpsPort, () => {
                        console.log(`The https server is listening on port ${config.httpsPort} in ${config.envName} mode.`);
                    });
                });

        } else {
            console.warn('To enable https key and cert files must exists in folder ./https. Please check README.md');
        }
    });


// server logic
// The server should respond to all requests with a string.
const unifiedServer = (req, res) => {
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

        // Choose the handler this request should go to. If one is not found, use the not found handler
        const chosenHandler = typeof(router[path]) !== 'undefined' ? router[path] : handlers.notFound;

        // Construct the data object to send to the handler
        const data = {
            'path': path,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        };

        // Router the request to the handler specified in the router
        chosenHandler(data, (err, statusCode, responsePayload) => {
            res.setHeader('Content-Type', 'application/json');
            if (err) {
                res.writeHead(500);
                res.end(err.message);

                // Log the request
                console.error(`${requestTime.toISOString()} Request received: ${data.method} ${data.path}
    Error:`, err);

            } else {
                // Use the status code called back by the handler, or default to 200
                statusCode = typeof(statusCode) === 'number' ? statusCode : 200;

                // Use the payload called back by the handler. or default to an empty object
                responsePayload = typeof(responsePayload) === 'object' ? responsePayload : {};

                // Convert the payload to a string
                const payloadString = JSON.stringify(responsePayload);

                // Return the response
                res.writeHead(statusCode);
                res.end(payloadString);

                // Log the request
                console.log(`${requestTime.toISOString()} Request received: ${data.method} ${data.path}; Response: ${statusCode}, Payload:`, payloadString);

            }

        });


    });

};

// Define the handlers
const handlers = {};

// Sample handler
handlers.sample = (data, callback) => {
    // Callback an http status code, and a payload object

    callback(null, 406, {'name': 'sample handler'});
};

// Ping handler
handlers.echo = (data, callback) => {
    // Callback an http status code, and a payload object
    if (data.method === 'POST') {
        if (data.headers['content-type'] === 'application/json') {
            callback(null, 200, JSON.parse(data.payload));
        } else {
            callback(null, 200, {'payload': data.payload});
        }
    } else {
        callback(null, 406, {'error': 'only POST is supported'});
    }
};

// Not found handler
handlers.notFound = (data, callback) => {
    callback(null, 404);
};

// Define a request router
const router = {
    'sample': handlers.sample,
    'echo': handlers.echo,
};