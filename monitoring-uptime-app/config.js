/*
 * Create and export configuration variables.
 *
 */

// Container for all the environments

const environments = {};

// Staging (default) environment
environments.staging = {
    'port': 3000,
    'envName': 'staging'
};


// Production environment

environments.production = {
    'port': 5000,
    'envName': 'production'
};

// Determine which environment was passed as a command-line argument
const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : 'staging';

// validate NODE_ENV.
if (typeof(environments[currentEnvironment]) !== 'object') {
    const message = `NODE_ENV ${currentEnvironment} invalid. Available options are ${Object.keys(environments)}`;
    throw message;
}
const environmentToExport = environments[currentEnvironment];

// Export the module
module.exports = environmentToExport;
