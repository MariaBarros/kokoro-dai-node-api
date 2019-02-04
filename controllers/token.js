/*------------------------------------------------------**
** Dependencies - Models, Controllers & Data            **
**------------------------------------------------------*/
let Token = require('../models/token');
let userCtrl = require('../controllers/user');
let _store = require('../controllers/data');

const tokenCtrl = {};

tokenCtrl.getAvailableMethods = function(){
  return Token.getAvailableMethods();
}

/*------------------------------------------------------**
** Getting token's data by id                           **
**------------------------------------------------------**
* @param {String} id: token's id                        **
**------------------------------------------------------*/
tokenCtrl.getOne = function(id, callback){
  _store.read(Token.getDataSource(), id, function(err, token){
    if(err)
      callback(true, {message: "The token doesn't exist"});
    else      
      callback(false, token);
  });     
};

/*------------------------------------------------------**
** Creating a new token                                 **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
*   - userId: user's id                                 **
*   - password                                          **
**------------------------------------------------------*/
tokenCtrl.create = function(data, callback){  
  let token = new Token(data.userId, data.password);  
  // Get user
  userCtrl.getOne(token.userId, function(err, userData){
    if(!err){
      // Compare the sent password to the password stored in the user object              
      if(token.password == userData.password){
        // Create a new token with a random name. Set an expiration date 1 hour in the future.
        token.setToken();
        // Store the token
        _store.create(Token.getDataSource(), token.userId, token, function(err){
          if(err)
            callback(true, {message: `Error when trying to create the ${token.tokenId} token`});
          else
            callback(false, token);
        });        
      } else 
        callback(true, {'Error' : 'Password did not match the specified user\'s stored password'});          
    }else
      callback(true, {'Error': "The user doesn't exist"});      
  });
};

/*------------------------------------------------------**
** Handler for deleting a token                         **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
*   - data.queryStringObject.id: user's id (required)   **
**------------------------------------------------------*/
tokenCtrl.delete = function(id,callback){  
  _store.delete(Token.getDataSource(), id, function(err){
    if(!err)
      callback(false, {message: `The token ${id} was deleted`});  
    else
      callback(true, {message: `Error when trying to delete the token ${id}`})
  });  
};

/*------------------------------------------------------**
** Updating the token data                              **
**------------------------------------------------------*/
tokenCtrl.update = function(tokenData, callback){
  if(Token.isValidToken(tokenData.expires)){
    // Set the expiration an hour from now
    tokenData.expires = Token.updateTokenExpires();
    // Store the new updates
    _store.update(Token.getDataSource(), tokenData, function(err){
      if(!err){
        callback(null, tokenData);
      } else
        callback(500, {'Error' : 'Could not update or create the token.'});
    });
  } else
    callback(400,{"Error" : "The token has already expired, and cannot be extended."});
}

tokenCtrl.verify = function(token, callback){
  // Lookup the token
  this.getOne(token, function(err, tokenData){
    if(!err){            
      callback(false);      
    }else
    callback(true, tokenData);
  });  
}

// Export the handlers for tokens
module.exports = tokenCtrl;