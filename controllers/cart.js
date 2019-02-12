/*------------------------------------------------------**
** Dependencies - Models & Data                         **
**------------------------------------------------------*/
let _Cart = require('../models/cart');
let _store = require('../controllers/data');
let helpers = require('../helpers/index');

const cartController = {};

cartController.getAvailableMethods = function(method){
  return _Cart.getAvailableMethods().indexOf(method) > -1;
}

cartController.create = function (clientId, secret, item, callback){
   let cart = new Cart(clientId, secret, item);
   callback(cart);
}

cartController.update = function (cartTransaction, callback){
  if(cartTransaction.hasOwnProperty("clientId") && cartTransaction.hasOwnProperty("secret")){

    // Create a new cart if cart.Id doesn´t exists
    if(!cartTransaction.id){ 
      let cart = new _Cart(cartTransaction.clientId, cartTransaction.secret, cartTransaction.item);
      if(cart.hasRequiredProperties()){
        cart.id = cart.setId();     
        _store.create(_Cart.getDataSource(), cart.id, cart, function(err){
          if(!err)
            callback(false,{message : `The new cart for client ${cart.clientId} was created`});
          else 
            callback(true,{message: err}); 
        });
      }
      else{
        callback(true,{'message' : 'Missing data for update.'});
      }
    }
    else{
      if(cartTransaction.hasOwnProperty("action")){
        this.getOne(cartTransaction.id, function (err, cartData) {
          if(!err){
            let cart = new _Cart(cartData.clientId, cartData.secret);
            cart.id = cartData.id;
            cart.items = cartData.items;

            let itemAction = cartTransaction.action;            
            switch(itemAction){
              case "add":
                cart.setItem(cartTransaction.item);
                break;
              case "remove":
                cart.removeItem(cartTransaction.item);
                break;
            }
            // Update cart
            _store.update(_Cart.getDataSource(), cart.id, cart, function(err){
              if(!err)
                callback(false,{message : 'The cart was updated'});
              else 
                callback(true,{message: err}); 
            }); 
          }
          else{
            callback(true,{'message' : `The cart ${cartData.id} does not exist`});
          }
        });
      }
      else{
        callback(true,{'Error' : "The action property is required"}); 
      }
    }
  }
  else{
    callback(true,{'Error' : "Missing item: the clientId and secret properties are required"});
  }
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
