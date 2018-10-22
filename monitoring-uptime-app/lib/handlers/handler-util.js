/**
 * Helper utils
 */

// Dependencies
const cryptoService = require('../crypto-service');
const _responses = require('../rest-service').responses;

// modules

const handlerUtil = {};

handlerUtil.extractNonEmptyString = (value) => {
    return typeof (value) === 'string' && value.trim().length > 0 ? value.trim() : null;
};

handlerUtil.extractPhoneString = (value) => {
    return typeof (value) === 'string' && value.trim().length === 10 ? value.trim() : null;
};

handlerUtil.extractBoolean = (value) => {
    return typeof (value) === 'boolean' ? value : false;
};

handlerUtil.phash = async (value) => {
    try {
        return cryptoService.phashPromise(value);
    } catch (ex) {
        throw new _responses.ErrorResponse(500, ex);
    }
};


module.exports = handlerUtil;