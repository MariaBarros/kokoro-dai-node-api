/*------------------------------------------------------**
** Dependencies - Models                                **
**------------------------------------------------------*/
let User = require('../models/user');
let userController = require('../controllers/user');

/*------------------------------------------------------**
** Define the users handlers                            **
**------------------------------------------------------*/
const userHandlers = {
  users: function(req,callback){    
    if(User.getAvailableMethods().indexOf(req.method) > -1){
      let data = (req.method == "post" || req.method == "put") ? JSON.parse(req.payload) : req.queryStringObject;
      userHandlers[req.method](data,callback);
    } else {
      callback(405);
    }
  }
};

/*------------------------------------------------------**
** Handler for creating a new user                      **
**------------------------------------------------------**
* @param {Object} data: user data                       **
**------------------------------------------------------*/
userHandlers.post = function(data, callback){
  userController.update(data, callback);
};

/*------------------------------------------------------**
** Handler for getting data for one or more users       **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
*   - data.queryStringObject.id: user's id (optional)   **
**------------------------------------------------------*/
userHandlers.get = function(data,callback){
  // Checking the queryStringObject for id
  let id = typeof(data.id) == 'string' ? data.id.trim() : false;
  if(id){    
    // Getting data of a particular user
    userController.getOne(id, callback);    
  } else {
    // Getting the users collection
    userController.getAll(data, callback);    
  }
};

/*------------------------------------------------------**
** Handler for updating a user                          **
**------------------------------------------------------**
* @param {Object} data: user data                       **
**------------------------------------------------------*/
userHandlers.put = function(data,callback){
  userController.update(data, callback);
};

/*------------------------------------------------------**
** Handler for deleting a user                          **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
*   - data.queryStringObject.id: user's id (required)   **
**------------------------------------------------------*/
userHandlers.delete = function(data,callback){
  // Check that phone number is valid
  let id = typeof(data.id) == 'string' ? data.id.trim() : false;
  if(id){
    userController.delete(id, callback);
  } else {
    callback(400,{'Error' : "Missing id: the user's id is required"});
  }
};

// Export the handlers for users
module.exports = userHandlers;