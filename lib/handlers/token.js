/*------------------------------------------------------**
** Dependencies - Controllers & helpers                 **
**------------------------------------------------------*/
let _tokenCtrl = require('../controllers/token');
const helpers = require('../helpers/index');

/*------------------------------------------------------**
** Define the users handlers                            **
**------------------------------------------------------*/
const tokenHandlers = {
  handlers: function(req,callback){    
    if(_tokenCtrl.getAvailableMethods().indexOf(req.method) > -1){      
      let data = (req.method !== "get" && req.method !== "delete") ? JSON.parse(req.payload) : req.queryStringObject;
      _tokens[req.method](data,callback);
    } else {
      callback(405);
    }
  }
};

// Container for all the tokens methods
_tokens  = {};

/*------------------------------------------------------**
** Handler for creating a new token                     **
**------------------------------------------------------**
* @param {Object} data: user's id & password            **
**------------------------------------------------------*/
_tokens.post = function(data, callback){
  const password = helpers.isNotEmptyString(data.password) ? data.password.trim() : false;
  const username = helpers.isNotEmptyString(data.username) ? data.username.trim() : false;

  if(!username || ! password){
    callback(400,{'Error' : "Missing username & password: the username & password are required"});
    return;
  }  

  // Response a new token object, otherwise error
  _tokenCtrl.create(data).then((session)=>{    
    callback(false, session);
  }, (err) =>{    
    callback(406, err);
  });  
  
};

/*------------------------------------------------------**
** Handler for getting data for a single token          **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
*   - data.queryStringObject.id: token's id             **
**------------------------------------------------------*/
_tokens.get = function(data,callback){
  // Checking the token's id
  if(helpers.isNotEmptyString(data.id) === false){
    callback(400,{'Error' : "Missing id: the token's id is required"});
    return;
  } 

  // Getting data of a particular token
  _tokenCtrl.getOne(data.id.trim()).then((tokenData) => {
    callback(false, tokenData);
  }, (err) =>{
    callback(404, err);
  });  
  
};

/*------------------------------------------------------**
** Handler for updating a token                         **
**------------------------------------------------------**
* @param {Object} data: token's id & extends            **
**------------------------------------------------------*/
_tokens.put = function(data, callback){
  const id = helpers.isNotEmptyString(data.id) && data.id.trim().length >= 20 ? data.id.trim() : false;
  const extend = typeof(data.extend) == 'boolean' && data.extend == true ? true : false;

  if(!id || !extend){
    callback(400,{"Error": "Missing required field(s) or field(s) are invalid."});
    return;
  }

  // Lookup the existing token
  _tokenCtrl.getOne(id).then((tokenData) =>{

    _tokenCtrl.update(tokenData).then((updatedToken)=>{
       callback(false, updatedToken);
    }, (err) =>{
      callback(true, err);
    });

  }, (err)=>{
    callback(404, err);
  });

};

/*------------------------------------------------------**
** Handler for deleting a token                         **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
*   - data.queryStringObject.id: token's id (required)  **
**------------------------------------------------------*/
_tokens.delete = function(data,callback){
  // Check that id is valid
  const id = typeof(data.id) == 'string' ? data.id.trim() : false;
  if(!id){
    callback(400,{'Error' : "Missing id: the token's id is required", data: data});
    return;
  }

  _tokenCtrl.getOne(id).then((tokenData) =>{
    _tokenCtrl.delete(id).then(()=>{
      callback(false, tokenData);
    }, (err) =>{
      callback(500, err);  
    })
  }, (err)=>{
    callback(404, err);
  });
  
};

// Export the handlers for tokens
module.exports = tokenHandlers;