/*------------------------------------------------------**
** Dependencies - Models & Data                         **
**------------------------------------------------------*/
let _Check = require('../models/check');
let _store = require('../controllers/data');
let _userCtrl = require('../controllers/user');
let helpers = require('../helpers/index');
let config = require('../config');

const checkCtrl = {};

checkCtrl.getAvailableMethods = function(method){
  return _Check.getAvailableMethods().indexOf(method) > -1;
}

/*------------------------------------------------------**
** Get all checks                                       **
**------------------------------------------------------*/
checkCtrl.getAll = function(){
  let checks = [], dataSource = _Check.getDataSource();

  return new Promise((resolve, reject)=>{

    _store.list(dataSource).then((checkFiles)=>{
      if(checkFiles.length == 0){
        resolve(checks);
        return;
      }
      for ( let i = 0, length = checkFiles.length - 1; i <= length; i++) {
        _store.read(dataSource, checkFiles[i]).then((check)=>{
          checks.push(check);
          if(i == length){
            resolve(checks);
          }
        }, (err)=>{
          reject(err);
        });        
      }      
    }, (err)=>{
      reject(err);
    });

  });
    
};

/*------------------------------------------------------**
** Read in the check data                               **
**------------------------------------------------------**
* @param {String} id: check's id                        **
**------------------------------------------------------*/
checkCtrl.getOne = function(id){
  return new Promise((resolve, reject)=>{
    _store.read(_Check.getDataSource(), id).then((checkData)=>{
       resolve(checkData);
    },(err)=>{
      reject({code: 404, message: `The check's: ${id} does not exist`});
    })    
  });
  
};

/*------------------------------------------------------**
** Handler for creating a new check                     **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
*   - {String} userId: user id related to the check     **
**------------------------------------------------------*/
checkCtrl.create = function(data){  

  return new Promise((resolve, reject)=>{

    if(!_Check.hasRequiredProperties(data)){
      reject({code: 406, message: "Missing data for create the check"});
    }

    //Get user data
    _userCtrl.getOne(data.username).then(userData=>{
      let userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];

      //Verify remain checks for the user
      if(userChecks.length < config.maxChecks){
        // Create the check's random id
        data.id = helpers.createRandomString(20);

        //Create the new check
        _store.create(_Check.getDataSource(), data.id, data).then(()=>{
          // Update the user data              
          userData.checks = userChecks;
          userData.checks.push(data.id);

          //Update the user data
          _userCtrl.update(userData).then(()=>{
            resolve(data)
          }, (err)=>{
            reject(err);
          });
        }, (err)=>{
          reject(err);
        });          
      }else{
        //The user credit for checks is full
        reject({code: 406, message: `The user ${userData.username} already has the maximum number of checks (${config.maxChecks}).`});
      }
    }, (err)=>{
      reject(err);
    });

  });  
     
};

/*------------------------------------------------------**
** Handler for updating the check data                 **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
**------------------------------------------------------*/
checkCtrl.update = function(check){  
  
  return new Promise((resolve, reject)=>{

    if(!_Check.hasRequiredProperties(check)){
      reject({code: 406, message: "Missing or invalid data for updating the check"});    
    }

    _store.update(_Check.getDataSource(), check.id, check).then(()=>{
      resolve({message: `The check id ${check.id} was updated.`});
    }, (err)=>{
      reject(err);
    });

  });  
    
};

/*------------------------------------------------------**
** Handler for deleting a user's check                  **
**------------------------------------------------------**
* @param {String} id: check's id (required)             **
* @param {String} userId: user's id (required)          **
**------------------------------------------------------*/
checkCtrl.delete = function(id, userId){
  return new Promise((resolve, reject)=>{
    //Delete the check
    _store.delete(_Check.getDataSource(), id).then(()=>{
      //Get user for update
      _userCtrl.getOne(userId).then((userData)=>{
        let userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [],
        checkPosition = userChecks.indexOf(id);
        // Remove the deleted check from their list of checks                    
        if(checkPosition > -1){
          userChecks.splice(checkPosition,1);
          // Re-save the user's data
          userData.checks = userChecks;
          //Update user
          _userCtrl.update(userData).then(()=>{
            resolve({message: `The user's checks were updated and the check was removed.`});
          }, (err)=>{
            reject(err);
          });
        }else{
          reject({"Error" : "Could not find the check on the user's object, so could not remove it."});
        }    
      }, (err)=>{
        reject(err);
      });
    }, (err)=>{
      reject(err);
    });

  });  
 
};

/*------------------------------------------------------**
** Handler for deleting user's check file               **
** This function is called when a user is deleted       **
* @param {String}: check id                             **
**------------------------------------------------------**/
checkCtrl.deleteFile = function(id){      
  return new Promise((resolve, reject)=>{
    _store.delete(_Check.getDataSource(), id).then(()=>{
      resolve();
    }, (err)=>{
      reject(err);
    });  
  });  
};

// Export the handlers for users checks
module.exports = checkCtrl;