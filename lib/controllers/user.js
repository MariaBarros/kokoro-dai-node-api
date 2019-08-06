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
userCtrl.getAll = function(filters){
  let users = [], userDataSource = _User.getDataSource();

  return new Promise((resolve, reject)=>{

    _store.list(userDataSource).then((usersFiles)=>{
      if(usersFiles.length == 0){
        resolve(users);
      }else{

        for ( let i = 0, length = usersFiles.length - 1; i <= length; i++) {
          _store.read(userDataSource, usersFiles[i]).then((user)=>{
            delete user.password;
            users.push(user);
            if(i == length){
              resolve(users);
            }
          }, (err)=>{
            reject(err);
          });          
        }

      }
    }, (err)=>{
      reject(err);
    })
  });

};

/*------------------------------------------------------**
** Getting data for one user by id                      **
**------------------------------------------------------**
* @param {String} id: user's id                         **
**------------------------------------------------------*/
userCtrl.getOne = function(id){
  return new Promise((resolve, reject)=>{
    _store.read(_User.getDataSource(), id).then((user)=>{
      resolve(user);
    }, (err)=>{
      reject(err);
    });
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
userCtrl.create = function(userData){
  // Set user data and check for required field
  if(!userData.role){
    userData.role = 'Guest';
  }
  
  let user = new _User(userData.firstName, userData.lastName, userData.username, userData.password, userData.phone, userData.role);
  user.setPassword();

  return new Promise((resolve, reject)=>{
    if(!user.hasRequiredProperties()){
      reject({'message' : 'Missing data for create the account.'});
    }

    // Create a new user
    user.id = user.setId();
    _store.create(_User.getDataSource(), user.username, user).then(()=>{
      resolve({message : `The new user ${user.username} was created`});
    }, (err)=>{
      reject(err);
    });

  });
    
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
userCtrl.update = function(userData){      
  return new Promise((resolve, reject) => {
    // Get the user and update
    this.getOne(userData.username).then((user) => {
      let editedUser = { ...user,  ...userData };
      if(editedUser._method){
         delete editedUser._method;
      }        
        
      if(userData.password && userData.password.length < 24){
         editedUser.password = helpers.hash(userData.password)
      }        
      //Update the user
      _store.update(_User.getDataSource(), user.username, editedUser).then(() => {
        resolve({'message': `The user ${user.username} was updated`});
      }, (err) => {
        reject(err);
      });  
      
    }, (err) => {
      reject(err);
    });

  });  
  
};

/*------------------------------------------------------**
** Handler for deleting a user                          **
**------------------------------------------------------**
* @param {String} id: user's id (required)              **
**------------------------------------------------------*/
userCtrl.delete = function(id){
  return new Promise((resolve, reject)=>{
    //Get the user and delete
    this.getOne(id).then(() => {
      _store.delete(_User.getDataSource(), id).then(() => {
        resolve({message: `The user ${id} was deleted`});
      }, (err) => {
        reject(err);
      });    

    }, (err) => {
      reject(err);
    });  

  });
  
};

// Export the handlers for users
module.exports = userCtrl;