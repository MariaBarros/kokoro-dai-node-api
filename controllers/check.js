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
      callback(500, err);    
  });
};

/*------------------------------------------------------**
** Read in the check data                               **
**------------------------------------------------------**
* @param {String} check: check's id                     **
**------------------------------------------------------*/
checkCtrl.getOne = function(check,callback){
  _store.read(_Check.getDataSource(), check, function(err, checkData){
    if(!err && checkData)
      callback(false, checkData);
    else
      callback(404, {message: `The check's: ${check} does not exist`});
  });  
};

/*------------------------------------------------------**
** Handler for creating a new check                     **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
* @param {String} userId: user id for creating the check**
**------------------------------------------------------*/
checkCtrl.create = function(data, callback){
  if(!_Check.hasRequiredProperties(data))
    callback(406,{message: "Missing data for create the check"});
  
  _userCtrl.getOne(data.userId, function(err, userData){
    if(!err){
      let userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
      if(userChecks.length < config.maxChecks){
        // Create the check
        data.id = helpers.createRandomString(20);
        _store.create(_Check.getDataSource(), data.id, data, function(err){
          if(!err){
            // Update the user data              
            userData.checks = userChecks;
            userData.checks.push(data.id);
            _userCtrl.update(userData, function(err){
              if(err)
                callback(500,{message: 'Impossible update the user checks.'})
              else
                callback(false,data);
            });
          }else
            callback(err);
        });        
      }else
        callback(406, {message: `The user ${userData.username} already has the maximum number of checks (${config.maxChecks}).`});
    }else
      callback(err);
  });  
};

/*------------------------------------------------------**
** Handler for updating the check data                 **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
**------------------------------------------------------*/
checkCtrl.update = function(check, callback){
  if(!_Check.hasRequiredProperties(check))
    callback(406,{message: "Missing or invalid data for update the check"});
  
  _store.update(_Check.getDataSource(), check.id, check, function(err){
    if(!err){      
      callback(false, {message: `The check id ${check.id} was updated.`});
    } else {
      callback(500, {message: `Could not update the ckeck ${check.id}.`});
    }
  });  
};

/*------------------------------------------------------**
** Handler for deleting a user's check                  **
**------------------------------------------------------**
* @param {String} id: check's id (required)             **
* @param {String} userId: user's id (required)          **
**------------------------------------------------------*/
checkCtrl.delete = function(id, userId, callback){      
  _store.delete(_Check.getDataSource(), id, function(err){
    if(!err){
      // Get the user
      _userCtrl.getOne(userId, function(err, userData){
        if(!err && userData){
          let userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [],
          checkPosition = userChecks.indexOf(id);
          // Remove the deleted check from their list of checks                    
          if(checkPosition > -1){
            userChecks.splice(checkPosition,1);
            // Re-save the user's data
            userData.checks = userChecks;
            _userCtrl.update(userData, function(err, response){
              if(!err)
                callback(false, {message: `The user's checks were updated and the check was removed.`});
              else
                callback(500, {message: 'Could not update the user.'});
            });                      
          }else
            callback(404,{"Error" : "Could not find the check on the user's object, so could not remove it."});            
        }else
          callback(404, {message: `Could not find the user who created the check, so could not remove the check from the list of checks on their user object.`});
      });
    }else
      callback(500, {message: `Error when trying to delete the check ${id}.`});  
  });  
};

checkCtrl.deleteFile = function(id, callback){      
  _store.delete(_Check.getDataSource(), id, function(err){
    if(!err){      
      callback(false);
    }else
      callback(500, {message: `Error when trying to delete the check ${id}.`});  
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