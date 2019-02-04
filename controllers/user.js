/*------------------------------------------------------**
** Dependencies - Models & Data                         **
**------------------------------------------------------*/
let User = require('../models/user');
let _store = require('../controllers/data');

const userController = {};

userController.getAvailableMethods = function(method){
  return User.getAvailableMethods().indexOf(method) > -1;
}
/*------------------------------------------------------**
** Get all users                                        **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
**------------------------------------------------------*/
userController.getAll = function(filters, callback){
  let users = [];
  _store.list(User.getDataSource(), function(err, usersFiles){
    if(!err){
      if(usersFiles.length == 0)   
        callback(false, users);
      else{
        for ( let i = 0, length = usersFiles.length - 1; i <= length; i++) {
          _store.read(User.getDataSource(), usersFiles[i], function(err, user){
            if(!err){
              delete user.password;
              users.push(user);
              if(i == length)
                callback(false, users);
            }
          });
        }
      }
    }else
      callback(true, err);    
  });
};

/*------------------------------------------------------**
** Getting data for one user by id                      **
**------------------------------------------------------**
* @param {String} id: user's id                         **
**------------------------------------------------------*/
userController.getOne = function(id, callback){    
  _store.read(User.getDataSource(), id, function(err, user){
    if(err)
      callback(true, {message: "The user doesn't exist"});
    else{      
      callback(false, user);
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
userController.update = function(userData, callback){
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
**------------------------------------------------------*/
userController.delete = function(id,callback){  
  _store.delete(User.getDataSource(), id, function(err){
    if(!err)
      callback(false, {message: `The user ${id} was deleted`});
    else
      callback(true, {message: `Error when trying to delete the user ${id}`})
  });  
};

// Export the handlers for users
module.exports = userController;