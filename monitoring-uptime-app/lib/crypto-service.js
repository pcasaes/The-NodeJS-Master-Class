/**
 * Helpers for various tasks
 */

// Dependencies
const crypto = require('crypto');
const config = require('./config');

const cryptoService = {};

cryptoService.randomBytes = async (size) => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(size, (error, buff) => {
            if (!error) {
                resolve(buff);
            } else {
                reject(error);
            }
        });
    });
};


cryptoService.phashPromise = async (value) => {
    if (typeof(value) === 'string' && value.length > 0) {
        const salt = await cryptoService.randomBytes(16);
        return new Promise((resolve, reject) => {
            crypto.scrypt(value, salt, config.phash.keyLength, (err, derivedKey) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        'type': 'script',
                        'salt': salt.toString('hex'),
                        'keyLength': config.phash.keyLength,
                        'hash': derivedKey.toString('hex')
                    });
                }
            });
        });

    } else {
        callback('value is not a string with size > 0');
    }
};

cryptoService.phashMatchPromise = async (obj, value) => {
    return new Promise((resolve, reject) => {
        crypto.scrypt(value, Buffer.from(obj.salt, 'hex'), obj.keyLength, (err, derivedKey) => {
            if (err) {
                reject(err);
            } else {
                resolve(obj.hash === derivedKey.toString('hex'));
            }
        });
    });
};

const byteToHex = [];
for (let i = 0; i < 256; ++i) {
    byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

/**
 * Implementation https://github.com/kelektiv/node-uuid
 *
 * @returns {Promise<string>}
 */
cryptoService.uuid = async () => {
    const buf = await cryptoService.randomBytes(16);
    buf[6] = (buf[6] & 0x0f) | 0x40;
    buf[8] = (buf[8] & 0x3f) | 0x80;

    let i = 0;
    const bth = byteToHex;
    // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
    return ([bth[buf[i++]], bth[buf[i++]],
        bth[buf[i++]], bth[buf[i++]], '-',
        bth[buf[i++]], bth[buf[i++]], '-',
        bth[buf[i++]], bth[buf[i++]], '-',
        bth[buf[i++]], bth[buf[i++]], '-',
        bth[buf[i++]], bth[buf[i++]],
        bth[buf[i++]], bth[buf[i++]],
        bth[buf[i++]], bth[buf[i]]]).join('');
};

module.exports = cryptoService;