/*------------------------------------------------------**
** Dependencies - Controllers                           **
**------------------------------------------------------*/
let _userCtrl = require('../controllers/user');
let _cartCtrl = require('../controllers/cart');
let _tokenCtrl = require('../controllers/token');
let _Article = require('../models/article');

/*------------------------------------------------------**
** Define the carts handlers                            **
**------------------------------------------------------*/
const cartHandlers = {
  handlers: function(req,callback){
    if(_cartCtrl.getAvailableMethods(req.method)){
      let data = (req.method == "post" || req.method == "put") ? JSON.parse(req.payload) : req.queryStringObject;
      _carts[req.method](data, req.headers, callback);
    } else
      callback(405);
  }
};
_carts  = {};

/*------------------------------------------------------**
** Handler for creating or update a new cart            **
** The user sends a new transactions with a secret      **
**------------------------------------------------------**
* @param {Object} data: cart data                       **
*   - {String} secret
    - {String} clientId
    - {Article} item
**------------------------------------------------------*/
_carts.post = function(data, headers, callback){
  if(data.id)
    callback(406, {message: 'Cannot create the cart'});

  if(data.clientId && data.secret && data.item instanceof Object){
    _cartCtrl.create(data, callback);
  }    
  else{
    callback(true, {message: "You cannot create a cart sending data without an clientId and secret and item properties"})
  }    
};

_carts.put = function(data, headers, callback){
  let token = typeof(headers.token)=="string" && headers.token.length>0 ? headers.token : false;

  if(!token)
    callback(503);

  if(data.item && data.clientId){
    _cartCtrl.update(data.item, token, function(err, cart){
      if(!err && cart)
        callback(200, cart);
      else
        callback(500,err);
    });
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

// Export the handlers for users
module.exports = cartHandlers;