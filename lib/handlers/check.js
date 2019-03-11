/*--------------------------------------------------------------**
** Dependencies - Controllers                                   **
**--------------------------------------------------------------*/
let _checkCtrl = require('../controllers/check');
let _tokenCtrl = require('../controllers/token');
let _userCtrl = require('../controllers/user');

/*--------------------------------------------------------------**
** Define the checks handlers                                   **
/*--------------------------------------------------------------*/
const checkHandlers = {
  handlers: function(req,callback){    
    if(_checkCtrl.getAvailableMethods(req.method)){
      let data = (req.method !== "get") ? JSON.parse(req.payload) : req.queryStringObject;      
      // Send data, headers and callback function to available user's methods
      _checks[req.method](data, req.headers, callback);      
    } else
      callback(405);
  }
};

// Container for all the checks methods
_checks  = {};

/*--------------------------------------------------------------**
** Handler for creating a new check                             **
/*--------------------------------------------------------------**
* @param {Object} data: check data                              **
* Required:
*   - {String} protocol: http/Https                             **
    - {String} url, {String} method                             **
    - {Array} successCodes                                      **
    - {Number} timeoutSeconds                                   **
**--------------------------------------------------------------*/
_checks.post = function(data, headers, callback){
  let token = headers.token && typeof(headers.token) == 'string' ? headers.token.trim() : false;

  if(!token){
    callback(403, {message: "Access denied: you need a valid token for this action"});
    return
  }

  if(data.id){
    callback(406, {message: "You cannot create a check sending data with an id property"})    
    return
  }

  if(!data.username){
    callback(406, {message: "You cannot create a check the username value"})    
    return
  }
  
  _tokenCtrl.verifyToken(token, function(err, tokenData){    
    if(!err && tokenData.username && data.username){      
      _checkCtrl.create(data, callback);
    }
    else
      // Send token error
      callback(403,err);
  });
};

/*--------------------------------------------------------------**
** Handler for getting data for one check                       **
** A valid token is nedeed for this action                      **
/*--------------------------------------------------------------**
* @param {Object} data: Info about the request Object           **
*   - {String} data.userId: user's                              **
*   - {String} data.id: check's id                              **
**--------------------------------------------------------------*/
_checks.get = function(data, headers, callback){
  // Checking the queryStringObject for id and the token header
  let id = typeof(data.id) == 'string' ? data.id.trim() : false,    
    token = headers.token && typeof(headers.token) == 'string' ? headers.token.trim() : false;

  if(!token){
    callback(403, {message: "Access denied: you need a valid token for this action"});
    return
  }
  if(!id){
    callback(406, {message: "Missing required field: id"});
    return
  }

  // Validating the token
  _checkCtrl.getOne(id, function(err, check){
    if(!err){
      _tokenCtrl.verifyToken(token, function(err, tokenData){
        if(!err && tokenData && tokenData.userId == check.userId)
          callback(false, check);
        else{
          if(!tokenData)
            // Send token error
            callback(403, {message: "Access denied: you need a valid token for this action"});
          else
            callback(403, {message: "Access denied: The user doesn't match with the user token."});
        }          
      });  
    }else
      callback(true, err);
  });  
};

/*--------------------------------------------------------------**
** Handler for updating a user's check                          **
** A valid token is nedeed for this action                      **
/*--------------------------------------------------------------**
* @param {Object} data: user data                               **
* @param {Object} headers                                       **
    - {String} headers.token: user's token                      **
*   - {String} data.id: check's id                              **
**--------------------------------------------------------------*/
_checks.put = function(data, headers, callback){
  let id = typeof(data.uid) == 'string' ? data.uid.trim() : false,
    token = headers.token && typeof(headers.token) == 'string' ? headers.token.trim() : false;

  if(!token){
    callback(403, {message: "Access denied: you need a valid token for this action"});
    return
  }
  if(!id){
    callback(406, {message: "Missing required field: id"});
    return
  }

  // Get the check
  _checkCtrl.getOne(id, function(err, check){
    if(!err){
      // Check the token
      _tokenCtrl.verifyToken(token, function(err, tokenData){
        if(!err && tokenData && tokenData.userId == check.userId){
          let editedCheck = { ...check,  ...data };          
          _checkCtrl.update(editedCheck, callback);
        }else{
          if(!tokenData)
            // Send token error
            callback(403, {message: "Access denied: you need a valid token for this action"});
          else
            callback(403, {message: "Access denied: The user doesn't match with the user token."});
        }        
      });
    }else
      callback(404, err);
  });
};

/*--------------------------------------------------------------**
** Handler for deleting a user's check                          **
** A valid token is nedeed for this action                      **
/*--------------------------------------------------------------**
* @param {Object} data: Info about the request Object           **
*   - data.queryStringObject.id: check's id (required)          **
* @param {Object} headers                                       **
    - {String} headers.token: user's token                      **
**--------------------------------------------------------------*/
_checks.delete = function(data, headers, callback){
  // Check the check id and token
  let id = typeof(data.id) == 'string' ? data.id.trim() : false;
  let token = headers.token && typeof(headers.token) == 'string' ? headers.token.trim() : false;

  if(!token){
    callback(403, {message: "Access denied: you need a valid token for this action"});
    return
  }
  if(!id){
    callback(406, {message: "Missing required field: id"});
    return
  }

  // Get the check
  _checkCtrl.getOne(id, function(err, check){
    if(!err && check)
      _tokenCtrl.verifyToken(token, function(err, tokenData){
        if(!err && tokenData && tokenData.userId == check.userId)
          _checkCtrl.delete(id, check.userId, callback);
        else{
          if(!tokenData)
            // Send token error
            callback(403, {message: "Access denied: you need a valid token for this action"});
          else
            callback(403, {message: "Access denied: The user doesn't match with the user token."});
        }
      });    
    else
    callback(404, err);
  });  
};

// Export the handlers for users
module.exports = checkHandlers;