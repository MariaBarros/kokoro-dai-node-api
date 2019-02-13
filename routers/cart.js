/*------------------------------------------------------**
** Dependencies - Controllers                           **
**------------------------------------------------------*/
let _userCtrl = require('../controllers/user');
let _cartCtrl = require('../controllers/cart');
let _tokenCtrl = require('../controllers/token');

/*------------------------------------------------------**
** Define the carts handlers                            **
**------------------------------------------------------*/
const cartHandlers = {
  handlers: function(req,callback){
    if(_cartCtrl.getAvailableMethods(req.method)){
      let data = (req.method == "post" || req.method == "put") ? JSON.parse(req.payload) : req.queryStringObject;
      // Send data, headers and callback function to available cart's methods
      _carts[req.method](data, req.headers, callback);
    } else
      callback(405);
  }
};

// Container for all the carts methods
_carts  = {};

/*------------------------------------------------------**
** Handler for creating or update a new cart                      **
**------------------------------------------------------**
* @param {Object} data: cart data                       **
**------------------------------------------------------*/
_carts.post = function(data, headers, callback){
  if(data.clientId){
    _cartCtrl.update(data, callback);
  }    
  else{
    callback(true, {message: "You cannot create a cart sending data without an clientId property"})
  }    
};

/*------------------------------------------------------**
** Handler for getting data for one or more users       **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
*   - data.id: get cart by id (required)                **
**------------------------------------------------------*/
_carts.get = function(data, headers, callback){
  // Checking the queryStringObject for id and the token header
  let id = typeof(data.id) == 'string' ? data.id.trim() : false;

  if(id){
    _cartCtrl.getOne(id, callback);
  }else{
    callback(true, {message: "Missing parameter: you need a cart id for this action"});
  }
};

// /*------------------------------------------------------**
// ** Handler for updating a user                          **
// **------------------------------------------------------**
// * @param {Object} data: user data                       **
// **------------------------------------------------------*/
// userHandlers.put = function(data, headers, callback){
//   let token = headers.token && typeof(headers.token) == 'string' ? headers.token.trim() : false;
//   if(token){
//     if(!data.id)
//       callback(true, {message: "Missing field id for update the user"})
//     else
//       userCtrl.update(data, callback);
//   }else
//     callback(true, {message: "Access denied: you need a valid token for this action"});
// };

// /*------------------------------------------------------**
// ** Handler for deleting a user                          **
// **------------------------------------------------------**
// * @param {Object} data: Info about the request Object   **
// *   - data.queryStringObject.id: user's id (required)   **
// **------------------------------------------------------*/
// userHandlers.delete = function(data, headers, callback){
//   // Check that phone number is valid
//   let id = typeof(data.id) == 'string' ? data.id.trim() : false;
//   let token = headers.token && typeof(headers.token) == 'string' ? headers.token.trim() : false;
//   if(token){
//     if(id)
//       userCtrl.delete(id, callback);
//     else
//       callback(true,{'Error' : "Missing id: the user's id is required"});
//   }else
//     callback(true, {message: "Access denied: you need a valid token for this action"});
// };

// Export the handlers for users
module.exports = cartHandlers;
