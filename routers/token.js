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
      let data = (req.method == "post" || req.method == "put") ? JSON.parse(req.payload) : req.queryStringObject;
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
  let password = helpers.isNotEmptyString(data.password) ? data.password.trim() : false;
  let userId = helpers.isNotEmptyString(data.userId) ? data.userId.trim() : false;

  if(userId && password){
    _tokenCtrl.create(data, callback);  
  }else{
    callback(400,{'Error' : "Missing userId & password: the user's id & password are required"});
  }
};

/*------------------------------------------------------**
** Handler for getting data for a single token          **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
*   - data.queryStringObject.id: token's id             **
**------------------------------------------------------*/
_tokens.get = function(data,callback){
  // Checking the toke's id  
  if(stringHelper.isNotEmptyString(data.id)){    
    // Getting data of a particular token
    _tokenCtrl.getOne(data.id.trim(), callback);    
  } else {
    callback(400,{'Error' : "Missing id: the token's id is required"});
  }
};

/*------------------------------------------------------**
** Handler for updating a token                         **
**------------------------------------------------------**
* @param {Object} data: token's id & extends            **
**------------------------------------------------------*/
_tokens.put = function(data, callback){
  let id = helpers.isNotEmptyString(data.id) && data.id.trim().length >= 20 ? data.id.trim() : false;
  let extend = typeof(data.extend) == 'boolean' && data.extend == true ? true : false;
  if(id && extend){
    // Lookup the existing token
    _tokenCtrl.getOne(id, function(err, tokenData){
      if(!err){
        // Check to make sure the token isn't already expired
        _tokenCtrl.update(tokenData, callback);
      }else
        callback(400, err);
    });    
  } else {
    callback(400,{"Error": "Missing required field(s) or field(s) are invalid."});
  }
};

/*------------------------------------------------------**
** Handler for deleting a user                          **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
*   - data.queryStringObject.id: user's id (required)   **
**------------------------------------------------------*/
_tokens.delete = function(data,callback){
  // Check that phone number is valid
  let id = typeof(data.id) == 'string' ? data.id.trim() : false;
  if(id){
    _tokenCtrl.delete(id, callback);
  } else {
    callback(400,{'Error' : "Missing id: the user's id is required"});
  }
};

// Export the handlers for users
module.exports = tokenHandlers;