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
      let data = (req.method == "post" || req.method == "put") ? JSON.parse(req.payload) : req.queryStringObject;      
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
* @param {Object} data: chech data                              **
* Required:
*   - {String} protocol: http/Https                             **
    - {String} url, {String} method                             **
    - {Array} successCodes                                      **
    - {Number} timeoutSeconds                                   **
**--------------------------------------------------------------*/
_checks.post = function(data, headers, callback){
  let token = headers.token && typeof(headers.token) == 'string' ? headers.token.trim() : false;
  if(!data.id && token){    
    _tokenCtrl.verifyToken(data.userId, token, function(err, response){
      if(!err && data.userId)
        _checkCtrl.create(data, callback);      
      else
        // Send token error
        callback(true, response);
    });              
  }else{
    if(data.id)
      callback(true, {message: "You cannot create a check sending data with an id property"})
    else
      callback(true, {message: "Access denied: you need a valid token for this action"});
  }
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
    userId = typeof(data.userId) == 'string' ? data.userId.trim() : false,
    token = headers.token && typeof(headers.token) == 'string' ? headers.token.trim() : false;

  if(id && userId && token){        
    // Getting data of a particular user
    _tokenCtrl.verifyToken(userId, token, function(err, response){
      if(!err)
        _checkCtrl.getOne(id, callback);
      else
        // Send token error
        callback(true, response);
    });    
  }else
    callback(true, {message: "Missing required field: id & userId or invalid token"});
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
  let id = typeof(data.id) == 'string' ? data.id.trim() : false,
    token = headers.token && typeof(headers.token) == 'string' ? headers.token.trim() : false;

  if(id && token){
    _checkCtrl.getOne(id, function(err, response){
      if(!err){
        // Check the token
        _tokenCtrl.verifyToken(response.userId, token, function(err, response){
          if(!err)
            _checkCtrl.update(data, callback);
          else
            // Send token error
            callback(true, response);
        });
      }else
        callback(true, response);
    });
  }else{
    if(!id)
      callback(true, {message: "Missing field id for update the user"});
    else
      callback(true, {message: "Access denied: you need a valid token for this action"});  
  }  
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
  // Check that phone number is valid
  let id = typeof(data.id) == 'string' ? data.id.trim() : false;
  let token = headers.token && typeof(headers.token) == 'string' ? headers.token.trim() : false;
  if(token){
    if(id)
      _tokenCtrl.verifyToken(data.id, token, function(err, response){
        if(!err)
          _checkCtrl.delete(id, callback);
        else
          // Send token error
          callback(true, response);
      });      
    else
      callback(true,{'Error' : "Missing id: the check's id is required"});
  }else
    callback(true, {message: "Access denied: you need a valid token for this action"});
};

// Export the handlers for users
module.exports = checkHandlers;