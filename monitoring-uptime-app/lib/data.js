/*
 * Library for storing and editing files
 */

const fs = require('fs');
const path = require('path');

// Container
const lib = {};

// Base directory
lib.baseDir = path.join(__dirname, '/../.data/');

try {
    fs.mkdirSync(lib.baseDir);
} catch (err) {
    // dir probably already exists.
}

function toPath(dir, file) {
    return `${lib.baseDir}${dir}/${file}.json`;
}

function writeFile(fd, stringData, callback) {
    fs.writeFile(fd, stringData, (writeError) => {
        if (!writeError) {
            fs.close(fd, (closeError) => {
                if (!closeError) {
                    callback(false);
                } else {
                    callback(`Error closing file`)
                }
            })
        } else {
            callback(`Error writing to file`);
        }
    });
}

lib.create = (dir, file, data, callback) => {
    // Open the file for writing
    fs.mkdir(`${lib.baseDir}${dir}`, (mkdirErr) => {
        fs.open(toPath(dir, file), 'wx', (err, fd) => {
            if (!err && fd) {
                // Convert data to string
                const stringData = JSON.stringify(data);
                writeFile(fd, stringData, callback);
            } else {
                callback(`Could not create new file, it may already exist ${dir}/${file}`);
            }
        });
    });
};

lib.read = (dir, file, callback) => {
    fs.readFile(toPath(dir, file), 'utf8', (err, data) => {
        callback(err, data ? JSON.parse(data) : data);
    });
};

lib.update = (dir, file, data, callback) => {
    fs.open(toPath(dir, file), 'r+', (err, fd) => {
        if (!err && fd) {
            // Convert data to string
            const stringData = JSON.stringify(data);

            fs.ftruncate(fd, (truncateError) => {
                if (!truncateError) {
                    writeFile(fd, stringData, callback);
                } else {
                    callback(`Error truncating file ${dir}/${file}`);
                }
            });

        } else {
            callback(`Could not open existing file, it may not exist ${dir}/${file}`);
        }
    });
};

lib.delete = (dir, file, callback) => {
    fs.unlink(toPath(dir, file), (err) => {
        if (!err) {
            callback(false);
        } else {
            callback('Error deleting file');
        }
    });
};

lib.exists = (dir, file, callback) => {
    fs.stat(toPath(dir, file), (err, stat) => {
        if (!err) {
            callback(null, stat.isFile());
        } else {
            callback(null, false);
        }
    });
};

lib.promise = {};

lib.promise.create = async (dir, file, data) => {
    return new Promise((resolve, reject) => {
        lib.create(dir, file, data, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

lib.promise.exists = async (dir, file) => {
    return new Promise((resolve, reject) => {
        lib.exists(dir, file, (err, r) => {
            if (err) {
                reject(err);
            } else {
                resolve(r);
            }
        });
    });
};

lib.promise.read = async (dir, file) => {
    return new Promise((resolve, reject) => {
        lib.read(dir, file, (err, r) => {
            if (err) {
                reject(err);
            } else {
                resolve(r);
            }
        });
    });
};

lib.promise.delete = async (dir, file) => {
    return new Promise((resolve, reject) => {
        lib.delete(dir, file, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

lib.promise.update = async (dir, file, data) => {
    return new Promise((resolve, reject) => {
        lib.update(dir, file, data, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

// export
module.exports = lib;