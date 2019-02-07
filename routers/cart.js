/*------------------------------------------------------**
** Dependencies - Controllers                           **
**------------------------------------------------------*/
let userCtrl = require('../controllers/user');
let cartCtrl = require('../controllers/cart');
let tokenCtrl = require('../controllers/token');

/*------------------------------------------------------**
** Define the users handlers                            **
**------------------------------------------------------*/
const cartHandlers = {
  handlers: function(req,callback){
    if(cartCtrl.getAvailableMethods(req.method)){
      let data = (req.method == "post" || req.method == "put") ? JSON.parse(req.payload) : req.queryStringObject;
      // Send data, headers and callback function to available user's methods
      cartHandlers[req.method](data, req.headers, callback);
    } else
      callback(405);
  }
};

/*------------------------------------------------------**
** Handler for creating a new user                      **
**------------------------------------------------------**
* @param {Object} data: user data                       **
**------------------------------------------------------*/
cartHandlers.post = function(data, headers, callback){
  if(typeof data === 'object'){
    cartCtrl.update(data, callback);
  else
    callback(true, {message: "You cannot create a user sending data with an id property"})
};

/*------------------------------------------------------**
** Handler for getting data for one or more users       **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
*   - data.id: get user by id (optional)                **
**------------------------------------------------------*/
userHandlers.get = function(data, headers, callback){
  // Checking the queryStringObject for id and the token header
  let id = typeof(data.id) == 'string' ? data.id.trim() : false,
    token = headers.token && typeof(headers.token) == 'string' ? headers.token.trim() : false;

  if(id && token){
    // Getting data of a particular user
    tokenCtrl.getOne(id, function(err, tokenData){
      if(!err && tokenData.tokenId == token && tokenData.expires > Date.now())
        userCtrl.getOne(id, callback);
      else{
        if(!err){
          if(tokenData.tokenId != token)
            callback(true, {message: `Incorrect Token ${token}`})
          else
            callback(true, {message: `The Token ${token} has expired`})
        }else
          callback(true, {message: `The Token ${token} does not exist`});
      }
    });
  }else{
    if(!id)
      // Getting the users collection
      userCtrl.getAll(data, callback);
    else
      callback(true, {message: "Access denied: you need a valid token for this action"});
  }
};

/*------------------------------------------------------**
** Handler for updating a user                          **
**------------------------------------------------------**
* @param {Object} data: user data                       **
**------------------------------------------------------*/
userHandlers.put = function(data, headers, callback){
  let token = headers.token && typeof(headers.token) == 'string' ? headers.token.trim() : false;
  if(token){
    if(!data.id)
      callback(true, {message: "Missing field id for update the user"})
    else
      userCtrl.update(data, callback);
  }else
    callback(true, {message: "Access denied: you need a valid token for this action"});
};

/*------------------------------------------------------**
** Handler for deleting a user                          **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
*   - data.queryStringObject.id: user's id (required)   **
**------------------------------------------------------*/
userHandlers.delete = function(data, headers, callback){
  // Check that phone number is valid
  let id = typeof(data.id) == 'string' ? data.id.trim() : false;
  let token = headers.token && typeof(headers.token) == 'string' ? headers.token.trim() : false;
  if(token){
    if(id)
      userCtrl.delete(id, callback);
    else
      callback(true,{'Error' : "Missing id: the user's id is required"});
  }else
    callback(true, {message: "Access denied: you need a valid token for this action"});
};

// Export the handlers for users
module.exports = userHandlers;
