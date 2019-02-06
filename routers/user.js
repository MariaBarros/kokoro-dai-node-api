/*--------------------------------------------------------------**
** Dependencies - Controllers                                   **
**--------------------------------------------------------------*/
let _userCtrl = require('../controllers/user');
let _tokenCtrl = require('../controllers/token');

/*--------------------------------------------------------------**
** Define the users handlers                                    **
/*--------------------------------------------------------------*/
const userHandlers = {
  handlers: function(req,callback){    
    if(_userCtrl.getAvailableMethods(req.method)){
      let data = (req.method == "post" || req.method == "put") ? JSON.parse(req.payload) : req.queryStringObject;      
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
    _userCtrl.update(data, callback);
  else
    callback(true, {message: "You cannot create a user sending data with an id property"})
};

/*--------------------------------------------------------------**
** Handler for getting data for one or more users               **
** If you want to get data of an user, a token valid is nedded  **
/*--------------------------------------------------------------**
* @param {Object} data: Info about the request Object           **
*   - data.id: user's id (optional)                             **
**--------------------------------------------------------------*/
_users.get = function(data, headers, callback){
  // Checking the queryStringObject for id and the token header
  let id = typeof(data.id) == 'string' ? data.id.trim() : false,
    token = headers.token && typeof(headers.token) == 'string' ? headers.token.trim() : false;

  if(id && token){        
    // Getting data of a particular user
    _tokenCtrl.verifyToken(id, token, function(err, response){
      if(!err)
        _userCtrl.getOne(id, callback);
      else
        // Send token error
        callback(true, response);
    });    
  }else{
    if(!id)
      // Getting the users collection
      _userCtrl.getAll(data, callback); 
    else      
      callback(true, {message: "Access denied: you need a valid token for this action"});         
  }
};

/*--------------------------------------------------------------**
** Handler for updating a user                                  **
** A valid token is nedeed for this action                      **
/*--------------------------------------------------------------**
* @param {Object} data: user data                               **
* @param {Object} headers                                       **
    - {String} headers.token: user's token                      **
**--------------------------------------------------------------*/
_users.put = function(data, headers, callback){
  let token = headers.token && typeof(headers.token) == 'string' ? headers.token.trim() : false;
  if(token){
    if(!data.id)
      callback(true, {message: "Missing field id for update the user"})
    else
      _tokenCtrl.verifyToken(data.id, token, function(err, response){
        if(!err)
          _userCtrl.update(data, callback);
        else
          // Send token error
          callback(true, response);
      });      
  }else
    callback(true, {message: "Access denied: you need a valid token for this action"});
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
  if(token){
    if(id)
      _tokenCtrl.verifyToken(data.id, token, function(err, response){
        if(!err)
          _userCtrl.delete(id, callback);
        else
          // Send token error
          callback(true, response);
      });      
    else
      callback(true,{'Error' : "Missing id: the user's id is required"});
  }else
    callback(true, {message: "Access denied: you need a valid token for this action"});
};

// Export the handlers for users
module.exports = userHandlers;