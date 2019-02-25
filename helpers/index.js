/*
 * Helpers for various tasks
 *
 */

// Dependencies
var config = require('../config');
var crypto = require('crypto');
var https = require('https');
var querystring = require('querystring');

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
  try{
    if(typeof(value) == "string")
      value = parseInt(value);
    return typeof(value) == 'number' && value % 1 === 0;
  } catch(e){
    return false;
  }    
};

helpers.isNotEmptArray = function(value){
    return value instanceof  Array && value.length > 1;
};

helpers.contain = function(options, value){
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


/*------------------------------------------------------**
** Send an SMS message via Twilio                       **
**------------------------------------------------------**
* @param {String} phone: phone number                   **
* @param {String} msg: the message we want to send      **
**------------------------------------------------------*/
helpers.sendTwilioSms = function(phone, msg, callback){
  // Validate parameters
  phone = typeof(phone) == 'string' && phone.trim().length == 14 ? phone.trim() : false;
  msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;

  if(phone && msg){

    // Configure the request payload
    let payload = {
      'From' : config.twilio.fromPhone,
      'To' : phone,
      'Body' : msg
    };

    let stringPayload = querystring.stringify(payload);


    // Configure the request details
    var requestDetails = {
      'protocol' : 'https:',
      'hostname' : 'api.twilio.com',
      'method' : 'POST',
      'path' : '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
      'auth' : config.twilio.accountSid + ':' + config.twilio.authToken,
      'headers' : {
        'Content-Type' : 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    };

    // Instantiate the request object
    var req = https.request(requestDetails,function(res){
        // Grab the status of the sent request
        var status =  res.statusCode;        
        // Callback successfully if the request went through
        if(status == 200 || status == 201){
          callback(false);
        } else {
          callback('Status code returned was '+ status);
        }
    });

    // Bind to the error event so it doesn't get thrown
    req.on('error',function(e){
      callback(e);
    });

    // Add the payload
    req.write(stringPayload);

    // End the request
    req.end();

  } else {
    callback('Given parameters were missing or invalid');
  }
};


// Export the module
module.exports = helpers;