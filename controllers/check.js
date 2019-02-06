/*------------------------------------------------------**
** Dependencies - Models & Data                         **
**------------------------------------------------------*/
let _Check = require('../models/check');
let _store = require('../controllers/data');
let _userCtrl = require('../controllers/user');
let helpers = require('../helpers/index');
let url = require('url');
let path = require('path');
let config = require('../config');

const checkCtrl = {};

checkCtrl.getAvailableMethods = function(method){
  return _Check.getAvailableMethods().indexOf(method) > -1;
}

/*------------------------------------------------------**
** Get all checks                                       **
**------------------------------------------------------*/
checkCtrl.getAll = function(callback){
  let checks = [], dataSource = _Check.getDataSource();
  _store.list(dataSource, function(err, checkFiles){
    if(!err){
      if(checkFiles.length == 0)   
        callback(false, checks);
      else{
        for ( let i = 0, length = checkFiles.length - 1; i <= length; i++) {
          _store.read(dataSource, checkFiles[i], function(err, check){
            if(!err){              
              checks.push(check);
              if(i == length)
                callback(false, checks);
            }
          });
        }
      }
    }else
      callback(true, err);    
  });
};

/*------------------------------------------------------**
** Read in the check data                               **
**------------------------------------------------------**
* @param {String} check: check's id                     **
**------------------------------------------------------*/
checkCtrl.getOne = function(check,callback){
  _store.read(_Check.getDataSource(), check,function(err, checkData){
    if(!err && checkData){
      callback(false, checkData);
    } else {
      callback(true, {message: `The check's: ${check} does not exist`});
    }
  });  
};

/*------------------------------------------------------**
** Handler for creating a new check                     **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
**------------------------------------------------------*/
checkCtrl.create = function(data, callback){ 
  if(_Check.hasRequiredProperties(data)){
    data.id = helpers.createRandomString(20);
    _userCtrl.getOne(data.userId, function(err, userData){
      if(!err){
        let userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
        if(userChecks.length < config.maxChecks){
          _store.create(_Check.getDataSource(), data.id, data, function(err){
            if(!err){
              // Update the user data              
              userData.checks = userChecks;
              userData.checks.push(data.id);
              _userCtrl.update(userData, callback);
            } else {
              callback(err, null);
            }
          });        
        }else
          callback(true, {message: `The user ${userData.username} already has the maximum number of checks (${config.maxChecks}).`});
      }else
        callback(true, {message: `The user for the token does not exist`});
    });    
  }else
    callback(true, {message: "Missing data for create the check"});
};

/*------------------------------------------------------**
** Handler for updating the check data                 **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
**------------------------------------------------------*/
checkCtrl.update = function(item, newData, callback){
  if(helpers.isNotEmptyString(newData.protocol) && helpers.contain(['https','http'], newData.protocol))
    item.protocol = newData.protocol;

  if(helpers.isNotEmptyString(data.url))
    item.url = newData.url.trim();

  if(helpers.isNotEmptyString(newData.method) && helpers.contain(['post','get','put','delete'], newData.method))
    item.method = newData.method;

  if(helpers.isObject(newData.successCodes) && newData.successCodes instanceof Array && newData.successCodes.length > 0)
    item.successCodes = newData.successCodes;

  if(helpers.isNumber(newData.timeoutSeconds) && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5)
   item.timeoutSeconds = newData.timeoutSeconds;

  _store.update(_Check.getDataSource(), item.id, item, function(err){
    if(!err){      
      callback(false, {message: `The check id ${item.id} was updated.`});
    } else {
      callback(500, {message: `Could not update the ckeck ${item.id}.`});
    }
  });  
};

/*------------------------------------------------------**
** Handler for deleting a user's check                  **
**------------------------------------------------------**
* @param {String} id: check's id (required)             **
**------------------------------------------------------*/
checkCtrl.delete = function(id,callback){
  let checkDataSource = _Check.getDataSource();

  _store.read(checkDataSource, id, function(err, checkData){
    if(!err){
      _store.delete(checkDataSource, id, function(err){
        if(!err){
          // Get the user
          _userCtrl.getOne(checkData.userId, function(err, userData){
            if(!err){
              let userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [],
              checkPosition = userChecks.indexOf(id);
              // Remove the deleted check from their list of checks                    
              if(checkPosition > -1){
                userChecks.splice(checkPosition,1);
                // Re-save the user's data
                userData.checks = userChecks;
                _userCtrl.update(userData, function(err, response){
                  if(!err)
                    callback(false, {message: `The user's checks were updated`});
                  else
                    callback(true, {message: 'Could not update the user.'});
                });                      
              } else {
                callback(500,{"Error" : "Could not find the check on the user's object, so could not remove it."});
              }
            }else
              callback(true, {message: `Could not find the user who created the check, so could not remove the check from the list of checks on their user object.`});
          });
        }else
          callback(true, {message: `Error when trying to delete the check ${id}.`});  
      });
    }else
      callback(true, {message: `The check ${id} could not be found.`})
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
  return helpers.isObject(checkData) && _Check.hasRequiredProperties(checkData);
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