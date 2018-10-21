/**
 *
 * Creates a rest service that handles http calls as rest.
 *
 */
const StringDecoder = require('string_decoder').StringDecoder;
const url = require('url');

const restService = {};

/**
 * Represents a call handler
 *
 * param: methods - array of allowed methods
 * param: service - function that takes request data and callback function
 */
class Handler {
    constructor(methods, service) {
        this.methods = methods;
        this.service = service;
    }
}

restService.Handler = Handler;

class ErrorResponse {
    constructor(status, message) {
        this.status = status;
        this.message = message;
    }
}

class RestResponse {
    constructor(status, payload) {
        this.status = status;
        this.payload = payload;
    }
}

restService.responses = {
    "ErrorResponse": ErrorResponse,
    "SuccessResponse": RestResponse
};

function parseRequest(headers, method, buffer) {
    if (headers['content-type'] === 'application/json') {
        try {
            return JSON.parse(buffer);
        } catch (e) {
            throw new ErrorResponse(400, e);
            x
        }
    }
    return buffer;
}


// server logic
// The server should respond to all requests with a string.
restService.RestService = class RestService {

    constructor(router, notFound) {
        this.router = router;
        this.notFound = notFound;
    }

    respond(req, res) {
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
            let chosenHandler = typeof(this.router[path]) !== 'undefined' ? this.router[path] : this.notFound;
            let pathParams = {};

            if (chosenHandler === this.notFound) {
                const keys = Object.keys(this.router);
                const parts = path.split('/');
                for (let i = 0; i < keys.length; i++) {
                    const ps = keys[i].split('/');
                    let found = ps.length > 0;
                    if (ps.length === parts.length) {
                        for (let p = 0; p < parts.length; p++) {
                            if (ps[p].indexOf('{') === 0 && ps[p].indexOf('}') === ps[p].length - 1) {
                                const param = ps[p].substring(1, ps[p].length - 1);
                                pathParams[param] = parts[p];
                            } else if (ps[p] !== parts[p]) {
                                found = false;
                                break;
                            }
                        }
                    } else {
                        found = false;
                    }
                    if (found) {
                        chosenHandler = this.router[keys[i]];
                        break;
                    } else {
                        pathParams = {};
                    }

                }
            }

            // Construct the data object to send to the handler
            const data = {
                'path': path,
                'queryStringObject': queryStringObject,
                'pathParams': pathParams,
                'method': method,
                'headers': headers,
                'payload': buffer ? parseRequest(headers, method, buffer) : null
            };

            const handlerCallback = (response) => {
                let statusCode = response.status;
                let responsePayload = response.payload;
                res.setHeader('Content-Type', 'application/json');

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


            };

            console.log(chosenHandler.methods);
            console.log(chosenHandler.methods.indexOf(data.method));
            if (chosenHandler.methods &&
                chosenHandler.methods.length &&
                chosenHandler.methods.indexOf(data.method) < 0) {
                handlerCallback(new RestResponse(406, {'error': `${data.method} is not supported`}));
            } else {

                // Router the request to the handler specified in the router
                try {
                    chosenHandler.service(data)
                        .then(handlerCallback)
                        .catch(ex => {
                            console.error(ex);
                            if (ex instanceof ErrorResponse) {
                                handlerCallback(new RestResponse(ex.status, {'error': `${ex.message}`}));
                            } else {
                                handlerCallback(new RestResponse(500, {'error': `${ex}`}));
                            }
                        });
                } catch (ex) {
                    console.error(ex);
                    if (ex instanceof ErrorResponse) {
                        handlerCallback(new RestResponse(ex.status, {'error': `${ex.message}`}));
                    } else {
                        handlerCallback(new RestResponse(500, {'error': `${ex}`}));
                    }
                }
            }


        });
    }
};


// Export the module
module.exports = restService;