/*------------------------------------------------------**
** Dependencies - Models & Data                         **
**------------------------------------------------------*/
let Cart = require('../models/cart');
let _store = require('../controllers/data');

const cartController = {};

cartController.getAvailableMethods = function(method){
  return Cart.getAvailableMethods().indexOf(method) > -1;
}

cartController.create = function (data, callback){
   let clientId= data.clientId;
   let secret= data.secret;
   let item= data.item;
   let cart = new Cart(clientId, secret, item);
   callback(cart);
}

cartController.update = function (cart, item, callback){
  if(item.hasProperty("remove")){
      cart.removeItem(item);
      callback(cart);
  }
  else{
    if(item.hasProperty("add")){
      cart.setItem(item);
      callback(cart);
    }
  }
}

/*------------------------------------------------------**
** Updating a user                                      **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
*   - data.payload: user data for creating              **
*     - firstName, lastName, username, password, role   **
*       are required                                    **
**------------------------------------------------------*/
cartController.update = function(userData, callback){
  // Set user data and check for required field
  let user = new User(userData.firstName, userData.lastName, userData.username, userData.password, userData.role);
  user.setPassword();
  if(user.hasRequiredProperties()){
    if(userData.id){
      // Get the user and update
      this.getOne(userData.id, function (err, userData) {
        if(!err)
          callback(false, {'message': `The user ${user.username} was updated`});
        else
          callback(true,{'message' : 'The user does not exist'});
      });
    }else{
      // Create a new user
      user.id = user.setId();
      _store.create(User.getDataSource(), user.id, user, function(err){
        if(!err)
          callback(false,{message : `The new user ${user.username} was created`});
        else
          callback(true,{message: err});
      });
    }
  }else
    callback(true,{'message' : 'Missing data for update.'});
};

/*------------------------------------------------------**
** Handler for deleting a user                          **
**------------------------------------------------------**
* @param {String} id: user's id (required)              **
**------------------------------------------------------
cartController.delete = function(id,callback){
  _store.delete(User.getDataSource(), id, function(err){
    if(!err)
      callback(false, {message: `The user ${id} was deleted`});
    else
      callback(true, {message: `Error when trying to delete the user ${id}`})
  });
};
*/
// Export the handlers for users
module.exports = cartController;
