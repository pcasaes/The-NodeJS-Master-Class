/**
 * There are the request handlers
 */

// Dependencies

const _data = require('./data');
const helpers = require('./helpers');
const Handler = require('./rest-service').Handler;
const _responses = require('./rest-service').responses;


// helper functions

function extractNonEmptyString(value) {
    return typeof (value) === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function extractPhoneString(value) {
    return typeof (value) === 'string' && value.trim().length === 10 ? value.trim() : null;
}

function extractBoolean(value) {
    return typeof (value) === 'boolean' ? value : false;
}

async function phash(value) {
    try {
        return helpers.phashPromise(value);
    } catch (ex) {
        throw new _responses.ErrorResponse(500, ex);
    }
}

// Define the handlers
const handlers = {};

const users = {
    GET: async (data) => {
        const phone = extractPhoneString(data.pathParam[1]);
        if (phone) {
            try {
                const u = await _data.promise.read('users', phone);
                return new _responses.SuccessResponse(200, {
                    'firstName': u.firstName,
                    'lastName': u.lastName,
                    'phone': u.phone
                });
            } catch (ex) {
                throw new _responses.ErrorResponse(404, 'User does not exist');
            }
        } else {
            throw new _responses.ErrorResponse(400, 'Missing required field');
        }
    },

    /**
     * Users - post
     *
     * Required data: firstName, lastName, phone, password, tosAgreement
     * Optional data: none
     *
     * @param data
     * @param callback
     */
    POST: async (data) => {
        // Check that all the required fields are filled out
        const payload = data.payload;
        const firstName = extractNonEmptyString(payload.firstName);
        const lastName = extractNonEmptyString(payload.lastName);
        const phone = extractPhoneString(payload.phone);
        const password = extractNonEmptyString(payload.password);
        const tosAgreement = extractBoolean(payload.tosAgreement);

        if (!!firstName &&
            !!lastName &&
            !!phone &&
            !!password &&
            tosAgreement) {
            // make sure that user doesn't already exist
            const exists = await _data.promise.exists('users', phone);

            if (exists) {
                throw new _responses.ErrorResponse(400, 'User with that phone number already exists');
            } else {
                const entity = {
                    'firstName': firstName,
                    'lastName': lastName,
                    'phone': phone,
                    'password': await phash(password),
                    'tosAgreement': tosAgreement
                };

                try {
                    await _data.promise.create('users', phone, entity);
                    return new _responses.SuccessResponse(201, {
                        'phone': phone
                    });
                } catch (ex) {
                    throw new _responses.ErrorResponse(400, 'User with that phone number already exists');
                }
            }

        }
        else {
            throw new _responses.ErrorResponse(400, 'Missing required fields.');
        }
    },

    PUT: async (data) => {
        const phone = extractPhoneString(data.pathParam[1]);
        if (phone) {
            const payload = data.payload;
            const firstName = extractNonEmptyString(payload.firstName);
            const lastName = extractNonEmptyString(payload.lastName);
            const password = extractPhoneString(payload.password);

            if (!firstName && !lastName && !password) {
                throw new _responses.ErrorResponse(400, 'Missing required field');
            }
            let u;
            try {
                u = await _data.promise.read('users', phone);
            } catch (ex) {
                throw new _responses.ErrorResponse(404, 'User does not exist');
            }
            if (firstName) {
                u.firstName = firstName;
            }
            if (lastName) {
                u.lastName = lastName;
            }
            if (password) {
                u.password = await phash(password);
            }
            await _data.promise.update('users', phone, u);
            return new _responses.SuccessResponse(200, {
                'phone': phone
            });
        } else {
            throw new _responses.ErrorResponse(400, 'Missing required field');
        }
    },

    DELETE: async (data) => {
        const phone = extractPhoneString(data.pathParam[1]);
        if (phone) {
            try {
                await _data.promise.delete('users', phone);
                return new _responses.SuccessResponse(200, {
                    'phone': phone
                });
            } catch (ex) {
                throw new _responses.ErrorResponse(404, 'User does not exist');
            }
        } else {
            throw new _responses.ErrorResponse(400, 'Missing required field');
        }
    }

};
// Users handler

handlers.users = new Handler(Object.keys(users), async (data) => {
    return users[data.method](data);
});

// Not found handler
handlers.notFound = new Handler([], (data, callback) => {
    callback(404);
});

module.exports = handlers;