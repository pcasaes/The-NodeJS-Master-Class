/*
 * Title: Jokes Library
 * Description: Utility library for getting a list of Jokes
 * Author: Leslie Lewis
 * Date: 10/24/17
 *
 */


// Dependencies
const fs = require('fs');

// App object
const jokes = {};

let arrayOfJokes = null;

// Get all the jokes and return them to the user
jokes.allJokes = function (callback) {

    if (arrayOfJokes) {
        callback(null, arrayOfJokes);
    } else {
        // Read the text file containing the jokes
        fs.readFile(__dirname + '/jokes.txt', 'utf8', (err, fileContents) => {
            if (err) {
                callback(err);
            } else {
                arrayOfJokes = fileContents.split(/\r?\n/);
                callback(null, arrayOfJokes);
            }
        });


    }


};

// Export the library
module.exports = jokes;