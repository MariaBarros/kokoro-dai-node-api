/*------------------------------------------------------**
** Dependencies - Models & Data                         **
**------------------------------------------------------*/
let User = require('../models/user');
let data = require('../data/data');

const userController = {};

/*------------------------------------------------------**
** Get all users                                        **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
**------------------------------------------------------*/
userController.getAll = function(filters, callback){
  data.read(User.getDataSource(), function(err, users){
    callback(err, users);
  }); 
};

/*------------------------------------------------------**
** Getting data for one user by id                      **
**------------------------------------------------------**
* @param {String} id: user's id                         **
**------------------------------------------------------*/
userController.getOne = function(id,callback){
  data.read(User.getDataSource(), function(err, users){
    if(err)
      callback(err, null);
    else{
      let userData = users.filter((el)=>el.id == id);      
      if(userData.length == 0)
        callback(400, {message: "The user doesn't exist"})
      else
        callback(null, userData);
    }
  });     
};

/*------------------------------------------------------**
** Updating a user                                      **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
*   - data.payload: user data for creating              **
*     - firstName, lastName, username, password, role   **
*       are required                                    **
**------------------------------------------------------*/
userController.update = function(data, callback){
  // Check for required field  
  let user = new User(data.firstName, data.lastName, data.username, data.password, data.role);
  
  if(user.hasRequiredProperties()){
    if(data.id){
      this.getOne(data.id, function (err, userData) {
        console.log(err, userData)
        if(!err){
          //Update
          callback(200, {'message': "User saved"});    
        }else{
          callback(400,{'Error' : 'no exists'});
        }
      })      
    } else {
      // Create
      callback(200,{message : 'The user was created'});
    }
  }else
    callback(400,{'Error' : 'Missing data for update.'});
};

/*------------------------------------------------------**
** Handler for deleting a user                          **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
*   - data.queryStringObject.id: user's id (required)   **
**------------------------------------------------------*/
userController.delete = function(id,callback){  
  callback(200, {message: "The user was deleted"});      
};

// Export the handlers for users
module.exports = userController;