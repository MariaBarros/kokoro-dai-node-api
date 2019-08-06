/*--------------------------------------------------------------**
** Dependencies - Controllers                                   **
**--------------------------------------------------------------*/
let _userCtrl = require('../controllers/user');
let _tokenCtrl = require('../controllers/token');
let _checkCtrl = require('../controllers/check');

/*--------------------------------------------------------------**
** Define the users handlers                                    **
/*--------------------------------------------------------------*/
const userHandlers = {
  handlers: function(req,callback){    
    if(_userCtrl.getAvailableMethods(req.method)){      
      let data = (req.method !== "get") ? JSON.parse(req.payload) : req.queryStringObject;            
      // Send data, headers and callback function to available user's methods
      _users[req.method](data, req.headers, callback);      
    } else
      callback(405);
  }
};

// Container for all the users methods
_users  = {};

/*--------------------------------------------------------------**
** Handler for creating a new user                              **
/*--------------------------------------------------------------**
* @param {Object} data: user data                               **
**--------------------------------------------------------------*/
_users.post = function(data, headers, callback){
  if(data.id){
    callback(true, {message: "You cannot create a user sending data with an id property"});
    return;
  }

  _userCtrl.create(data).then(()=>{
    callback(false, data);
  }, (err) =>{
    callback(500, err);
  });
  
};

/*--------------------------------------------------------------**
** Handler for getting data for one or more users               **
** A token valid is needed for this action                      **
/*--------------------------------------------------------------**
* @param {Object} data: Info about the request Object           **
*   - data.id: user's id (optional)                             **
*   - headers: the headers contain the user token               **
**--------------------------------------------------------------*/
_users.get = function(data, headers, callback){
  // Checking the queryStringObject for the user token
  const token = headers.token && typeof(headers.token) == 'string' ? headers.token.trim() : false;
  // Get the user id, if any
  const id = typeof(data.id) == 'string' ? data.id.trim() : false;

  if(!token){
    callback(true, {message: "Access denied: you need a valid token for this action"});  
    return;
  }
      
  // Verify the user token
  _tokenCtrl.verifyToken(token).then((tokenData) =>{
          
    if(id && tokenData.username == id){

      // Getting data of a particular user
      _userCtrl.getOne(id).then((user)=>{
        callback(false, user);
      }, (err)=>{
        callback(404, err);
      });

    }else{
      if(id){
        callback(true,{message: 'Only the user data owner can get its record.'});
        return;
      }

      // Getting the users collection
      _userCtrl.getAll(data).then((users)=>{
        callback(false, users);
      }, (err) =>{
        callback(500, err);
      });
      
    }
  }, (err) =>{
    callback(403, err);
  });
  
};

/*--------------------------------------------------------------**
** Handler for updating a user                                  **
** A valid token is nedeed for this action                      **
/*--------------------------------------------------------------**
* @param {Object} data: user data                               **
* @param {Object} headers                                       **
*   - {String} headers.token: user's token                      **
**--------------------------------------------------------------*/
_users.put = function(data, headers, callback){
  const token = headers.token && typeof(headers.token) == 'string' ? headers.token.trim() : false;

  if(!token || !data.username){
    if(!token){
      callback(true, {message: "Access denied: you need a valid token for this action"});  
    }else{
      callback(true, {message: "Missing field id for update the user"});
    }    
    return;
  }  

  _tokenCtrl.verifyToken(token).then((tokenData) =>{
    if(tokenData.username !== data.username){
      callback(true,{message: 'Only the user data owner can update its record.'});
      return;
    }

    _userCtrl.update(data).then(()=>{
      callback(false, data);
    }, (err) =>{
      callback(500, err);
    });

  }, (err) =>{
    callback(true, err);
  });

};

/*--------------------------------------------------------------**
** Handler for deleting a user                                  **
** A valid token is nedeed for this action                      **
/*--------------------------------------------------------------**
* @param {Object} data: Info about the request Object           **
*   - data.queryStringObject.id: user's id (required)           **
* @param {Object} headers                                       **
    - {String} headers.token: user's token                      **
**--------------------------------------------------------------*/
_users.delete = function(data, headers, callback){
  // Check that phone number is valid
  const id = typeof(data.username) == 'string' ? data.username.trim() : false;
  const token = headers.token && typeof(headers.token) == 'string' ? headers.token.trim() : false;

  if(!token || !id){
    if(!token){
      callback(403, {message: "Access denied: you need a valid token for this action"});  
    }else{
      callback(406,{'Error' : "Missing id: the user's id is required"});  
    }    
    return;
  }  

  _tokenCtrl.verifyToken(token).then((tokenData) =>{
    if(tokenData.username !== id){
      callback(403,{message: 'Only the user data owner can delete its record.'});
      return;
    }

    _userCtrl.getOne(id).then((userData)=>{

      let checks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];

      _userCtrl.delete(id).then(()=>{
        if(checks.length == 0){
          callback(200);
          return;
        }
        _users.deleteChecks(checks, callback);

      }, (err)=>{
        callback(500, {message: "Couldn't remove the user."});
      });

    },(err)=>{
      callback(404, {message: `The user with the id ${id} doesn't exist.`});
    });

  }, (err) =>{
    callback(403, {message: "Access denied: you need a valid token for this action"});
  });                
  
};

_users.deleteChecks = function(checks, callback){
  let checksDeleted = 0,
      deletionError = false;

  checks.forEach(function(checkId){

    _checkCtrl.deleteFile(checkId).then(()=>{

      checksDeleted +=1;
      if(checksDeleted == checks.length){
        if(!deletionError){
          callback(200);
        }else{
          callback(500, err)
        }
      }

    }, (err)=>{
      deletionError = true;
    });
    
  });
}
// Export the handlers for users
module.exports = userHandlers;