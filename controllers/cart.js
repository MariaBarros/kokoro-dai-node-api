let _Cart = require('../models/cart');
let _store = require('../controllers/data');
let _tokenCtrl = require('../controllers/token');

let helpers = require('../helpers/index');

const cartController = {};

cartController.getAvailableMethods = function(method){
  return _Cart.getAvailableMethods().indexOf(method) > -1;
}

cartController.create = function (data, callback){
   let cart = new _Cart(data.clientId, data.secret, data.item);
   cart.id = cart.setId();
   cart.total = _Cart.setTotal(cart.items);
   delete cart.secret;

   _store.create(_Cart.getDataSource(), cart.id, cart, function(err){
      if(!err)
        callback(false,cart);
      else 
        callback(500,{message: err}); 
    });
}

cartController.update = function (item, token, callback){
  this.getOne(token, function(err, cartData){
    if(!err && cartData){
      if(cartData.id == token){
        if(cartData.expires >= Date.now()){
          if(_Cart.getAvailableActions().indexOf(item.action) > -1){
            let items = _Cart.update(item, cartData.items);
            cartData.total = _Cart.setTotal(items);

            _store.update(_Cart.getDataSource(), cartData.id, cartData, function(err){
              if(!err)
                callback(false,cartData);
              else 
                callback(true,{message: err}); 
            }); 

          }
          else{
            callback(503);
          }
        }
        else{
          callback(503);
        }
      }
      else{
        callback(503);
      }
    }
  });
}

/*------------------------------------------------------**
** Getting data for cart by id                      **
**------------------------------------------------------**
* @param {String} id: cart's id                         **
**------------------------------------------------------*/
cartController.getOne = function(id, callback){    
  _store.read(_Cart.getDataSource(), id, function(err, cart){
    if(err){
      callback(true, {message: "The cart doesn't exist"});
    }
    else{      
      callback(false, cart);
    }
  });  
};


// Export the handlers for users
module.exports = cartController;