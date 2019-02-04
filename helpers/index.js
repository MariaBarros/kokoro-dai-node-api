/*
 * Helpers for various tasks
 *
 */

// Dependencies
var config = require('../config');
var crypto = require('crypto');

// Container for all the helpers
var helpers = {};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function(str){
  try{
    var obj = JSON.parse(str);
    return obj;
  } catch(e){
    return {};
  }
};

/*------------------------------------------------------**
** Creating a SHA256 hash                               **
**------------------------------------------------------**
* @param str: string for encrypting                     **
**------------------------------------------------------*/
helpers.hash = function(str){
  if(typeof(str) == 'string' && str.length > 0){
    var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

/*------------------------------------------------------**
** Validating a string value                            **
**------------------------------------------------------**
* @param value: the value for validating                **
**------------------------------------------------------*/
helpers.isNotEmptyString = function(value){
    return typeof(value) == 'string' && value.trim().length > 0
};

/*------------------------------------------------------**
** Validating an object                                 **
**------------------------------------------------------**/
helpers.isObject = function(value){
    return typeof(value) == 'object' && value !== null;
};

helpers.isInt = function(value){
    return typeof(value) == 'number' && value % 1 === 0;
};

helpers.isNotEmptArray = function(value){
    return value instanceof  Array && value.length > 1;
};

helpers.contain = function(value, options){
  return options.indexOf(value) > -1;
}

helpers.graterThanToday = function(expires){
  return expires > Date.now();
}

/*------------------------------------------------------**
** Creating a string of random alphanumeric characters, **
** of a given strLength                                 **
**------------------------------------------------------**
* @param strLength: string length for generating        **
**------------------------------------------------------*/
helpers.createRandomString = function(strLength){
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if(strLength){
    // Define all the possible characters that could go into a string
    var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    var str = '';
    for(i = 1; i <= strLength; i++) {
        // Get a random charactert from the possibleCharacters string
        var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
        // Append this character to the string
        str+=randomCharacter;
    }
    // Return the final string
    return str;
  } else {
    return false;
  }
};
// Export the module
module.exports = helpers;