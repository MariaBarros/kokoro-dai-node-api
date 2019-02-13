/*--------------------------------------------------------------**
** Dependencies - Controllers                                   **
**--------------------------------------------------------------*/
let _userCtrl = require('../controllers/user');
let _tokenCtrl = require('../controllers/token');
let _checkCtrl = require('../controllers/check');

/*--------------------------------------------------------------**
** Define the users handlers                                    **
/*--------------------------------------------------------------*/
const userHandlers = {
  handlers: function(req,callback){    
    if(_userCtrl.getAvailableMethods(req.method)){      
      let data = (req.method !== "get") ? JSON.parse(req.payload) : req.queryStringObject;            
      // Send data, headers and callback function to available user's methods
      _users[req.method](data, req.headers, callback);      
    } else
      callback(405);
  }
};

// Container for all the users methods
_users  = {};

/*--------------------------------------------------------------**
** Handler for creating a new user                              **
/*--------------------------------------------------------------**
* @param {Object} data: user data                               **
**--------------------------------------------------------------*/
_users.post = function(data, headers, callback){
  if(!data.id)
    _userCtrl.create(data, callback);
  else
    callback(true, {message: "You cannot create a user sending data with an id property"})
};

/*--------------------------------------------------------------**
** Handler for getting data for one or more users               **
** A token valid is needed for this action                      **
/*--------------------------------------------------------------**
* @param {Object} data: Info about the request Object           **
*   - data.id: user's id (optional)                             **
*   - headers: the headers contain the user token               **
**--------------------------------------------------------------*/
_users.get = function(data, headers, callback){
  // Checking the queryStringObject for the user token
  let token = headers.token && typeof(headers.token) == 'string' ? headers.token.trim() : false;

  if(!token)
    callback(true, {message: "Access denied: you need a valid token for this action"});  
  
  // Verify the user token
  _tokenCtrl.verifyToken(token, function(err, tokenData){
    if(!err && tokenData){
      // Get the user id, if any
      let id = typeof(data.id) == 'string' ? data.id.trim() : false;
      if(id && tokenData.userId == id)
        // Getting data of a particular user
        _userCtrl.getOne(id, callback);
      else{
        if(id)
          callback(true,{message: 'Only the user data owner can get its record.'})  
        else
          // Getting the users collection
          _userCtrl.getAll(data, callback);         
      }
    }else
      callback(true, err);
   });  
};

/*--------------------------------------------------------------**
** Handler for updating a user                                  **
** A valid token is nedeed for this action                      **
/*--------------------------------------------------------------**
* @param {Object} data: user data                               **
* @param {Object} headers                                       **
*   - {String} headers.token: user's token                      **
**--------------------------------------------------------------*/
_users.put = function(data, headers, callback){
  let token = headers.token && typeof(headers.token) == 'string' ? headers.token.trim() : false;

  if(!token)
    callback(true, {message: "Access denied: you need a valid token for this action"});
  
  if(!data.id)
    callback(true, {message: "Missing field id for update the user"})

  _tokenCtrl.verifyToken(token, function(err, tokenData){
    if(!err && tokenData){
      if(tokenData.userId == data.id)
        _userCtrl.update(data, callback);
      else
        callback(true,{message: 'Only the user data owner can update its record.'})  
    }else
      // Send token error
      callback(true, err);
  });    
};

/*--------------------------------------------------------------**
** Handler for deleting a user                                  **
** A valid token is nedeed for this action                      **
/*--------------------------------------------------------------**
* @param {Object} data: Info about the request Object           **
*   - data.queryStringObject.id: user's id (required)           **
* @param {Object} headers                                       **
    - {String} headers.token: user's token                      **
**--------------------------------------------------------------*/
_users.delete = function(data, headers, callback){
  // Check that phone number is valid
  let id = typeof(data.id) == 'string' ? data.id.trim() : false;
  let token = headers.token && typeof(headers.token) == 'string' ? headers.token.trim() : false;

  if(!token)
    callback(403, {message: "Access denied: you need a valid token for this action"});

  if(!id)
    callback(406,{'Error' : "Missing id: the user's id is required"});

  _tokenCtrl.verifyToken(token, function(err, tokenData){    
    if(!err && tokenData){
      if(tokenData.userId == id){
        _userCtrl.getOne(id, function(err, userData){
          if(!err && userData){
            let checks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
            _userCtrl.delete(id, function(err){
              if(!err){
                if(checks.length > 0){
                  _users.deleteChecks(checks, callback);
                }else
                  callback(200);
              }else
                callback(500, {message: "Couldn't remove the user."})
            });
          }else
            callback(404, {message: `The user with the id ${id} doesn't exist.`})
        });        
      }else
        callback(403,{message: 'Only the user data owner can delete its record.'})     
    }else
      // Send token error
      callback(403, {message: "Access denied: you need a valid token for this action"});
  });    
};

_users.deleteChecks = function(checks, callback){
  let checksDeleted = 0,
      deletionError = false;

  checks.forEach(function(checkId){
    _checkCtrl.deleteFile(checkId, function(err){
      if(err)
        deletionError = true

      checksDeleted +=1;
      if(checksDeleted == checks.length){
        if(!deletionError)
          callback(200);
        else
          callback(500, err)
      }
    });                      
  });
}
// Export the handlers for users
module.exports = userHandlers;