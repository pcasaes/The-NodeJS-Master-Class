/**
 * Helpers for various tasks
 */

// Dependencies
const crypto = require('crypto');
const config = require('./config');

const helpers = {};


helpers.phashPromise = async (value) => {
    if (typeof(value) === 'string' && value.length > 0) {
        const salt = crypto.randomBytes(16);
        return new Promise((resolve, reject) => {
            crypto.scrypt('secret', salt, config.phash.keyLength, (err, derivedKey) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        'type': 'script',
                        'salt': salt,
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

module.exports = helpers;