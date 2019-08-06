/*--------------------------------------------------------------**
** Dependencies - Controllers                                   **
**--------------------------------------------------------------*/
let _checkCtrl = require('../controllers/check');
let _tokenCtrl = require('../controllers/token');
let _userCtrl = require('../controllers/user');

/*--------------------------------------------------------------**
** Define the checks handlers                                   **
/*--------------------------------------------------------------*/
const checkHandlers = {
  handlers: function(req,callback){    
    if(_checkCtrl.getAvailableMethods(req.method)){      
      let data = (req.method !== "get") ? JSON.parse(req.payload) : req.queryStringObject;      
      // Send data, headers and callback function to available user's methods
      _checks[req.method](data, req.headers, callback);      
    } else
      callback(405);
  }
};

// Container for all the checks methods
_checks  = {};

const ERRORS = {
  DENIED: {code: 403, message : "Access denied: you need a valid token for this action"}
};

/*--------------------------------------------------------------**
** Handler for creating a new check                             **
/*--------------------------------------------------------------**
* @param {Object} data: check data                              **
* Required:
*   - {String} protocol: http/Https                             **
    - {String} url, {String} method                             **
    - {Array} successCodes                                      **
    - {Number} timeoutSeconds                                   **
**--------------------------------------------------------------*/
_checks.post = function(data, headers, callback){
  const token = headers.token && typeof(headers.token) == 'string' ? headers.token.trim() : false;
  
  if(!token){      
    callback(403,ERRORS.DENIED.message);    
    return;
  }

  if(data.id || !data.username){
    const msg = data.id ? "You cannot create a check sending data with an id property": "You cannot create a check without the username value";      
    callback(403, {message: msg});    
    return;
  }

  _tokenCtrl.verifyToken(token).then((tokenData) => {
    _checkCtrl.create(data).then(()=>{
      callback(false, data);
    }, (err) => {
      callback(true, err);
    });
  }, (err) => {
    callback(403, err);
  });  
  
};

/*--------------------------------------------------------------**
** Handler for getting data for one check                       **
** A valid token is nedeed for this action                      **
/*--------------------------------------------------------------**
* @param {Object} data: Info about the request Object           **
*   - {String} data.userId: user's                              **
*   - {String} data.id: check's id                              **
**--------------------------------------------------------------*/
_checks.get = function(data, headers, callback){
  // Checking the queryStringObject for id and the token header
  const id = typeof(data.id) == 'string' ? data.id.trim() : false;
  const token = headers.token && typeof(headers.token) == 'string' ? headers.token.trim() : false;

  if(!token || !id){
    const err = (!token) ? ERRORS.DENIED : {code: 406, message: "Missing required field: id"};
    callback(err.code, {message: err.message});
    return;
  }  

  // Validating the token
  _checkCtrl.getOne(id).then((check)=>{
    _tokenCtrl.verifyToken(token).then((tokenData) => {
      if(tokenData.userId == check.userId){
        callback(false, check);
      }else{
        callback(403, {message: "Access denied: The user doesn't match with the user token."});
      }
    }, (err) => {
      callback(403, {message: ERRORS.DENIED.message});
    });
   },(err) => {
     callback(err.code, err.message);  
   });
    
};

/*--------------------------------------------------------------**
** Handler for updating a user's check                          **
** A valid token is nedeed for this action                      **
/*--------------------------------------------------------------**
* @param {Object} data: user data                               **
* @param {Object} headers                                       **
    - {String} headers.token: user's token                      **
*   - {String} data.id: check's id                              **
**--------------------------------------------------------------*/
_checks.put = function(data, headers, callback){
  const id = typeof(data.uid) == 'string' ? data.uid.trim() : false;
  const token = headers.token && typeof(headers.token) == 'string' ? headers.token.trim() : false;

  if(!token || !id){
    const err = (!token) ? ERRORS.DENIED : {code: 406, message: "Missing required field: id"};
    callback(err.code, {message: err.message});
    return;
  }  

  // Get the check
  _checkCtrl.getOne(id).then((check) => {
    _tokenCtrl.verifyToken(token).then((tokenData)=>{
      if(tokenData.userId !== check.userId){
        callback(403, {message: "Access denied: The user doesn't match with the user token."});
        return;
      }
       
      let editedCheck = { ...check,  ...data };          
      _checkCtrl.update(editedCheck).then(()=>{
        callback(false);
      }, (err) => {
        callback(true, err);
      });
                
     }, (err)=>{
       callback(403, {message: ERRORS.DENIED.message});
     })
  }, (err) => {
    callback(404, err);
  });

};

/*--------------------------------------------------------------**
** Handler for deleting a user's check                          **
** A valid token is nedeed for this action                      **
/*--------------------------------------------------------------**
* @param {Object} data: Info about the request Object           **
*   - data.queryStringObject.id: check's id (required)          **
* @param {Object} headers                                       **
    - {String} headers.token: user's token                      **
**--------------------------------------------------------------*/
_checks.delete = function(data, headers, callback){
  // Check the check id and token
  const id = typeof(data.uid) == 'string' ? data.uid.trim() : false;
  const token = headers.token && typeof(headers.token) == 'string' ? headers.token.trim() : false;

  if(!token || !id){
    const err = (!token) ? ERRORS.DENIED : {code: 406, message: "Missing required field: id"};
    callback(err.code, {message: err.message});
    return;
  }  

  // Get the check
  _checkCtrl.getOne(id).then((check) =>{

    _tokenCtrl.verifyToken(token).then((tokenData) => {
      if(tokenData.userId !== check.userId){
        callback(403, {message: "Access denied: The user doesn't match with the user token."});
        return;
      }
      
      _checkCtrl.delete(id, check.username).then(()=>{
        callback(false);
      }, (err) => {
        callback(500, err);
      });

    }, (err) => {
      callback(403, {message: ERRORS.DENIED.message});
    });  

  }, (err) => {
    callback(404, err);
  });
  
};

// Export the handlers for users
module.exports = checkHandlers;