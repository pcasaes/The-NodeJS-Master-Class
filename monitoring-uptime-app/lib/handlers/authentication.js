/**
 * Authentication handler
 */

// Dependencies

const tokenService = require('../services/token-service');
const handlerUtil = require('./handler-util');
const Handler = require('../rest-service').Handler;
const _responses = require('../rest-service').responses;


// handlers

const tokens = {
    /**
     * requires: phone, password
     * @param data
     * @returns {Promise<void>}
     * @constructor
     */
    POST: async function (data) {
        const payload = data.payload;
        const phone = handlerUtil.extractPhoneString(payload.phone);
        const password = handlerUtil.extractNonEmptyString(payload.password);

        if (!!phone && !!password) {
            const token = await tokenService.authenticate(phone, password);
            if (!token) {
                throw new _responses.ErrorResponse(401, 'Authentication failed');
            } else {
                return new _responses.SuccessResponse(200, token);
            }
        } else {
            throw new _responses.ErrorResponse(400, 'Missing required fields.');
        }
    },

    GET: async function (data) {
        const tokenId = handlerUtil.extractNonEmptyString(data.pathParams.id);
        if (tokenId) {
            try {
                const tokenData = await tokenService.get(tokenId);
                if (!tokenData) {
                    throw 'token not found';
                } else {
                    return new _responses.SuccessResponse(200, tokenData);
                }
            } catch (ex) {
                throw new _responses.ErrorResponse(404, 'Token does not exist');
            }
        } else {
            throw new _responses.ErrorResponse(400, 'Missing required field');
        }
    },

    PUT: async function (data) {
        const tokenId = handlerUtil.extractNonEmptyString(data.pathParams.id);
        if (tokenId) {
            const extend = handlerUtil.extractBoolean(data.queryStringObject.extend);
            if (extend) {
                const tokenData = await tokenService.extend(tokenId);
                if (!tokenData) {
                    throw new _responses.ErrorResponse(401, 'Not authorized');
                }
                return new _responses.SuccessResponse(200, tokenData);
            } else {
                throw new _responses.ErrorResponse(400, 'No alteration requested');
            }
        } else {
            throw new _responses.ErrorResponse(400, 'Missing required field');
        }
    },

    DELETE: async function (data) {
        const tokenId = handlerUtil.extractNonEmptyString(data.pathParams.id);
        if (tokenId) {
            try {
                if (await tokenService.invalidate(tokenId)) {
                    return new _responses.SuccessResponse(200, {
                        'message': 'token invalidated'
                    });
                }
                throw 'not found';
            } catch (ex) {
                throw new _responses.ErrorResponse(404, 'Token does not exist');
            }
        } else {
            throw new _responses.ErrorResponse(400, 'Missing required field');
        }
    },
};

// module
const authentication = {};

authentication.tokens = new Handler(Object.keys(tokens), async (data) => {
    return tokens[data.method](data);
});


module.exports = authentication;