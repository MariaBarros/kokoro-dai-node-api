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
tokenCtrl.getOne = function(id){
  return new Promise((resolve, reject)=>{
    _store.read(Token.getDataSource(), id).then((token) => {
      resolve(token);
    }, (err)=>{
      reject({message: "The token doesn't exist"});
    })    
  });
  
};

/*------------------------------------------------------**
** Creating a new token                                 **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
*   - userId: user's id                                 **
*   - password                                          **
**------------------------------------------------------*/
tokenCtrl.create = function(data){  
  let token = new Token(data.username, data.password);

  return new Promise((resolve, reject)=>{
    // Get user
    _userCtrl.getOne(token.username).then((userData)=>{
      // Compare the sent password to the password stored in the user object              
      if(token.password !== userData.password){
        reject({'Error' : 'Password did not match the specified user\'s stored password' + userData.password + "-" + token.password + "- "+ data.password});
      }
      
      // Create a new token with a random name. Set an expiration date 1 hour in the future.
      token.setToken();

      // Store the token        
      _store.create(Token.getDataSource(), token.tokenId, token).then( () =>{
        resolve(token);
      }, (err) => {
        reject({message: `Error when trying to create the ${token.tokenId} token`, err:err});
      });    
        
    });

  });  
  
};

/*------------------------------------------------------**
** Handler for deleting a token                         **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
*   - data.queryStringObject.id: user's id (required)   **
**------------------------------------------------------*/
tokenCtrl.delete = function(id){
  return new Promise((resolve, reject)=>{
    _store.delete(Token.getDataSource(), id).then(()=>{
      resolve();
    }, (err) =>{
      reject(err);
    });
  });
};

/*------------------------------------------------------**
** Updating the token data                              **
**------------------------------------------------------*/
tokenCtrl.update = function(tokenData){

  return new Promise((resolve, reject)=>{
    if(tokenData.expires <= Date.now()){
      reject({"Error" : "The token has already expired, and cannot be extended."});
    }

    // Set the expiration an hour from now
    tokenData.expires = Token.updateTokenExpires();
    // Store the new updates
    _store.update(Token.getDataSource(), tokenData.tokenId, tokenData).then(()=>{
      resolve(tokenData);
    }, (err) => {
      reject({'Error' : 'Could not update the token.'});
    });
  });
  
}

/*------------------------------------------------------**
** Handler for verifying a token                        **
**------------------------------------------------------**
* @param {String} token: user's token (required)        **
**------------------------------------------------------*/
tokenCtrl.verifyToken = function(token, callback){
  // Get the token
  return new Promise((resolve, reject)=>{

    this.getOne(token).then((tokenData)=>{
      if(tokenData.expires > Date.now()){
        resolve(tokenData);
      }else{
        reject({message: 'session expired'});
      }
    }, (err) => {
      reject(err);
    });

  });

}

// Export the handlers for tokens
module.exports = tokenCtrl;