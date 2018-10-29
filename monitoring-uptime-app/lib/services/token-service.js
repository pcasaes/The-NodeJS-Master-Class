const cryptoService = require('../crypto-service');
const _data = require('../data');


const service = {};

service.authenticate = async (phone, password) => {
    try {
        const u = await _data.promise.read('users', phone);
        if (await cryptoService.phashMatchPromise(u.password, password)) {
            const tokenId = await cryptoService.uuid();
            const expires = Date.now() + 1000 * 60 * 60;
            const tokenObject = {
                'phone': phone,
                'id': tokenId,
                'expires': expires
            };

            await _data.promise.create('tokens', tokenId, tokenObject);
            return tokenObject;
        }
    } catch (ex) {
        console.debug('Authentication failed', ex);
    }
};

service.get = async (tokenId) => {
    try {
        return await _data.promise.read('tokens', tokenId);
    } catch (ex) {
        console.debug(`token ${tokenId} not found`, ex);
    }
    return null;
};

service.isAuthorized = async (tokenId, token) => {
    if (!tokenId) {
        return null;
    }
    if (!token) {
        token = await service.get(tokenId);
    }
    if (!token) {
        return null;
    } else if (token.expires < Date.now()) {
        _data.promise.delete('tokens', tokenId);
        return null;
    }
    return token;
};

service.extend = async (tokenId) => {
    const token = await service.get(tokenId);
    if (!token) {
        return null;
    } else if (await service.isAuthorized(tokenId, token)) {
        token.expires = Date.now() + 1000 * 60 * 60;
        await _data.promise.update('tokens', tokenId, token);
        return token;
    }
    return null;
};

service.invalidate = async (tokenId) => {
    const token = await service.get(tokenId);
    if (!!token && await service.isAuthorized(tokenId, token)) {
        await _data.promise.delete('tokens', tokenId);
        return true;
    }
    return false;
};

module.exports = service;