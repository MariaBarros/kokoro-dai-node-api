/*------------------------------------------------------**
** Dependencies - Controllers                           **
**------------------------------------------------------*/
let userCtrl = require('../controllers/user');
let cartCtrl = require('../controllers/cart');
let tokenCtrl = require('../controllers/token');

/*------------------------------------------------------**
** Define the carts handlers                            **
**------------------------------------------------------*/
const cartHandlers = {
  handlers: function(req,callback){
    if(cartCtrl.getAvailableMethods(req.method)){
      let data = (req.method == "post" || req.method == "put") ? JSON.parse(req.payload) : req.queryStringObject;
      // Send data, headers and callback function to available user's methods
      _carts[req.method](data, req.headers, callback);
    } else
      callback(405);
  }
};
_carts  = {};

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
_carts.post = function(data, headers, callback){
  console.log(data);
  if(data.clientId){
    console.log(data.clientId);
    cartCtrl.create(data, callback);
  }
  else{
    callback(true, {message: "You cannot create a cart sending data with an id property"})
  }

};
module.exports = cartHandlers;