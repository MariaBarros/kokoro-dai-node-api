/*------------------------------------------------------**
** Dependencies - Models & Data                         **
**------------------------------------------------------*/
let _User = require('../models/user');
let _store = require('../controllers/data');
const helpers = require('../helpers/index');

const userCtrl = {};

userCtrl.getAvailableMethods = function(method){
  return _User.getAvailableMethods().indexOf(method) > -1;
}

/*------------------------------------------------------**
** Get all users                                        **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
**------------------------------------------------------*/
userCtrl.getAll = function(filters, callback){
  let users = [], userDataSource = _User.getDataSource();
  _store.list(userDataSource, function(err, usersFiles){
    if(!err){
      if(usersFiles.length == 0)   
        callback(false, users);
      else{
        for ( let i = 0, length = usersFiles.length - 1; i <= length; i++) {
          _store.read(userDataSource, usersFiles[i], function(err, user){
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
      callback(err);    
  });
};

/*------------------------------------------------------**
** Getting data for one user by id                      **
**------------------------------------------------------**
* @param {String} id: user's id                         **
**------------------------------------------------------*/
userCtrl.getOne = function(id, callback){    
  _store.read(_User.getDataSource(), id, function(err, user){
    if(err)
      callback({message: "The user doesn't exist"});
    else{      
      callback(false, user);
    }
  });  
};

/*------------------------------------------------------**
** Creating a user                                      **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
*   - data.payload: user data for creating              **
*     - firstName, lastName, username, password, role   **
*       are required                                    **
**------------------------------------------------------*/
userCtrl.create = function(userData, callback){
  // Set user data and check for required field
  if(!userData.role)
    userData.role = 'Guest';
  
  let user = new _User(userData.firstName, userData.lastName, userData.username, userData.password, userData.phone, userData.role);
  user.setPassword();
  if(user.hasRequiredProperties()){    
    // Create a new user
    user.id = user.setId();
    _store.create(_User.getDataSource(), user.username, user, function(err){
      if(!err)
        callback(false,{message : `The new user ${user.username} was created`});
      else 
        callback(err);
    });          
  }else
    callback(true,{'message' : 'Missing data for create the account.'});
};

/*------------------------------------------------------**
** Updating a user                                      **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
*   - data.payload: user data for creating              **
*     - firstName, lastName, username, password, role   **
*       are optional                                    **
*     - id is required                                  **
**------------------------------------------------------*/
userCtrl.update = function(userData, callback){      
  // Get the user and update
  this.getOne(userData.username, function (err, user) {
    if(!err){      
      let editedUser = { ...user,  ...userData };
      if(editedUser._method)
        delete editedUser._method;
      
      if(userData.password && userData.password.length<24)
        editedUser.password = helpers.hash(userData.password)
      
      _store.update(_User.getDataSource(), user.username, editedUser, function(err){
        if(!err)
          callback(false, {'message': `The user ${user.username} was updated`});    
        else
          callback(err);
      });      
    }
    else
      callback(404,{'message' : 'The user does not exist'});
  });  
};

/*------------------------------------------------------**
** Handler for deleting a user                          **
**------------------------------------------------------**
* @param {String} id: user's id (required)              **
**------------------------------------------------------*/
userCtrl.delete = function(id,callback){
  this.getOne(id, function(err){        
    if(err)
      callback(true, err);
    else{
      _store.delete(_User.getDataSource(), id, function(err){
        if(!err)
          callback(false, {message: `The user ${id} was deleted`});
        else
          callback(true, {message: `Error when trying to delete the user ${id}`})
      });
    }
  });  
};

// Export the handlers for users
module.exports = userCtrl;