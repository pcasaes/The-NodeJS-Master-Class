/**
 * Creates and start an http server
 *
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const config = require('./config');

// Instantiate the HTTP server
function startHttpServer(callback) {
    const httpServer = http.createServer(callback);

    // Start the http server, and have it listen to port ${config.httpPort}.
    httpServer.listen(config.httpPort, () => {
        console.log(`The http server is listening on port ${config.httpPort} in ${config.envName} mode.`);
    });
}


/**
 * Instantiate the HTTPS server
 *
 * @returns {void}
 */
function startHttpsServer(callback) {


    try {
        const httpsServerOptions = {
            'key': fs.readFileSync('./https/key.pem'),
            'cert': fs.readFileSync('./https/cert.pem')
        };

        const httpsServer = https.createServer(httpsServerOptions, callback);

// Start the https server, and have it listen to port ${config.httpsPort}.
        httpsServer.listen(config.httpsPort, () => {
            console.log(`The https server is listening on port ${config.httpsPort} in ${config.envName} mode.`);
        });
    } catch (ex) {
        console.warn('To enable https key and cert files must exists in folder ./https. Please check README.md');

    }
}


const server = {
    /**
     * starts an http server
     * callback - a callback function that receives a request and response object
     */
    "start": (callback) => {
        startHttpServer(callback);
        startHttpsServer(callback)
    }
};

// Export the module
module.exports = server;