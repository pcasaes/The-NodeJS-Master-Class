/**
 * There are the user request handlers
 */

// Dependencies

const _data = require('../data');
const handlerUtil = require('./handler-util');
const Handler = require('../rest-service').Handler;
const _responses = require('../rest-service').responses;



function checkAuthorizedUser(phone, token) {
    if (!token) {
        throw new _responses.ErrorResponse(401, 'Not authorized');
    }
    if (token.phone !== phone) {
        throw new _responses.ErrorResponse(403, 'Forbidden');
    }
}

// Define the handlers
const handlers = {};

const users = {
    GET: async (data) => {
        const phone = handlerUtil.extractPhoneString(data.pathParams.phone);
        if (phone) {
            checkAuthorizedUser(phone, data.token);
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
     */
    POST: async (data) => {
        // Check that all the required fields are filled out
        const payload = data.payload;
        const firstName = handlerUtil.extractNonEmptyString(payload.firstName);
        const lastName = handlerUtil.extractNonEmptyString(payload.lastName);
        const phone = handlerUtil.extractPhoneString(payload.phone);
        const password = handlerUtil.extractNonEmptyString(payload.password);
        const tosAgreement = handlerUtil.extractBoolean(payload.tosAgreement);

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
                    'password': await handlerUtil.phash(password),
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
        const phone = handlerUtil.extractPhoneString(data.pathParams.phone);
        if (phone) {
            checkAuthorizedUser(phone, data.token);

            const payload = data.payload;
            const firstName = handlerUtil.extractNonEmptyString(payload.firstName);
            const lastName = handlerUtil.extractNonEmptyString(payload.lastName);
            const password = handlerUtil.extractPhoneString(payload.password);

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
                u.password = await handlerUtil.phash(password);
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
        const phone = handlerUtil.extractPhoneString(data.pathParams.phone);
        if (phone) {
            checkAuthorizedUser(phone, data.token);

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



module.exports = handlers;