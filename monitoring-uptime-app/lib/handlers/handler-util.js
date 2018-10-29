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
    const type = typeof(value);
    if (type === 'boolean') {
        return value;
    } else {
        return value === 'true';
    }
};

handlerUtil.phash = async (value) => {
    try {
        return cryptoService.phashPromise(value);
    } catch (ex) {
        throw new _responses.ErrorResponse(500, ex);
    }
};

handlerUtil.phashMatch = async (obj, value) => {
    try {
        return cryptoService.phashMatchPromise(obj, value);
    } catch (ex) {
        throw new _responses.ErrorResponse(500, ex);
    }
};

handlerUtil.extractToken = payload => {
    const auth = payload.headers['authorization'];
    if (!!auth && auth.startsWith('Bearer ')) {
        return auth.substr(7);
    }
    return null;
};


module.exports = handlerUtil;