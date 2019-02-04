/*------------------------------------------------------**
** Dependencies - Models & Data                         **
**------------------------------------------------------*/
let Check = require('../models/check');
let _store = require('../controllers/data');
let helpers = require('../helpers/index');
let url = require('url');
let path = require('path');

const checkCtrl = {};

/*------------------------------------------------------**
** Get all checks                                       **
**------------------------------------------------------**/
checkCtrl.getAll = function(callback){
  _store.list(Check.getDataSource(),function(err,checks){
    if(!err && checks && checks.length > 0){
      checks.forEach(function(check){
        // Read in the check data
        checkCtrl.getOne(check, callback);        
      });
    } else {
      callback(true, {message: 'Error: Could not find any checks to process'});
    }
  });
};

/*------------------------------------------------------**
** Read in the check data                               **
**------------------------------------------------------**
* @param {String} check: check's id                     **
**------------------------------------------------------*/
checkCtrl.getOne = function(check,callback){
  _store.read(Check.getDataSource(),check,function(err, originalCheckData){
    if(!err && originalCheckData){
      callback(false, originalCheckData);
    } else {
      callback(true, {message: `Error reading one of the check's data: ${check}`});
    }
  });  
};

/*------------------------------------------------------**
** Preparing check data for request                     **
**------------------------------------------------------**/
checkCtrl.setData = function(data){  
  data.id = trim(data.id);
  data.userPhone = trim(data.userPhone);
  data.url = trim(data.url);
  
  data.state = helpers.isNotEmptyString(data.state) && helpers.contain(['up','down'] , data.state) 
        ? data.state : 'down';

  return data;
}

/*------------------------------------------------------**
** Setting details for request                          **
**------------------------------------------------------**/
checkCtrl.setRequestDetail = function(data){  
  // Parse the hostname and path out of the originalCheckData
  let parsedUrl = url.parse(data.protocol +'://' + data.url, true);

  // Construct the request
  return {
    'protocol' : data.protocol + ':',
    'hostname' : parsedUrl.hostname,
    'method' : data.method.toUpperCase(),
    'path' : parsedUrl.path, // Using path not pathname because we want the query string
    'timeout' : data.timeoutSeconds * 1000
  };
}

/*------------------------------------------------------**
** Handler for validating the check data                 **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
**------------------------------------------------------*/
checkCtrl.isValid = function(checkData){    
  if(!helpers.isObject(checkData))
    return false;

  return Check.hasRequiredProperties(checkData);
};

/*------------------------------------------------------**
** Handler for updating the check data                 **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
**------------------------------------------------------*/
checkCtrl.update = function(newCheckData, callback){
  // Save the updates
  _store.update(Check.getDataSource(),newCheckData.id,newCheckData,function(err){
    if(!err){
      callback(false, newCheckData);
    } else {
      callback(true, err);
    }
  });
};

/*------------------------------------------------------**
** Handler for sending notification                     **
**------------------------------------------------------**
* @param {String} phone: user's phone                   **
* @param {String} msg: the message to send              **
**------------------------------------------------------*/
checkCtrl.sendNotification = function(phone, msg, callback){          
  // Alert the user as to a change in their check status        
  helpers.sendTwilioSms(phone, msg , function(err){
    if(err)
      callback(err);
    else
      callback(false);
   });
};
  
// Export the handlers for users
module.exports = checkCtrl;