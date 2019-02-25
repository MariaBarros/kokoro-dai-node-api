/*------------------------------------------------------**
** Dependencies - Models, Controllers & Data            **
**------------------------------------------------------*/
let Token = require('../models/token');
let _userCtrl = require('../controllers/user');
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
      callback(404,{message: "The token doesn't exist"});
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
  let token = new Token(data.username, data.password);  
  // Get user  
  _userCtrl.getOne(token.username, function(err, userData){
    if(!err){      
      // Compare the sent password to the password stored in the user object              
      if(token.password == userData.password){
        // Create a new token with a random name. Set an expiration date 1 hour in the future.
        token.setToken();
        // Store the token        
        _store.create(Token.getDataSource(), token.tokenId, token, function(err){
          if(err)
            callback(501, {message: `Error when trying to create the ${token.tokenId} token`, err:err});
          else
            callback(false, token);
        });        
      } else 
        callback(406,{'Error' : 'Password did not match the specified user\'s stored password' + userData.password + "-" + token.password + "- "+ data.password});
    }else
      callback(404, err);
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
      callback(500,{message: `Error when trying to delete the token ${id}`})
  });  
};

/*------------------------------------------------------**
** Updating the token data                              **
**------------------------------------------------------*/
tokenCtrl.update = function(tokenData, callback){
  if(tokenData.expires > Date.now()){
    // Set the expiration an hour from now
    tokenData.expires = Token.updateTokenExpires();
    // Store the new updates
    _store.update(Token.getDataSource(), tokenData.tokenId, tokenData, function(err){
      if(!err){
        callback(false, tokenData);
      } else
        callback({'Error' : 'Could not update the token.'});
    });
  } else
    callback(500,{"Error" : "The token has already expired, and cannot be extended."});
}

/*------------------------------------------------------**
** Handler for verifying a token                        **
**------------------------------------------------------**
* @param {String} token: user's token (required)        **
**------------------------------------------------------*/
tokenCtrl.verifyToken = function(token, callback){
  // Get the token  
  this.getOne(token, function(err, tokenData){    
    if(!err && tokenData.expires > Date.now())
      callback(false, tokenData);      
    else
      callback(err || {message: `The Token ${token} has expired`});
  });  
}

// Export the handlers for tokens
module.exports = tokenCtrl;