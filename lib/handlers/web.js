/*--------------------------------------------------------------**
** Dependencies - Controllers                                   **
**--------------------------------------------------------------*/
const pageCtrl = require('../controllers/page');

/*--------------------------------------------------------------**
** Define the web handlers                                      **
**--------------------------------------------------------------*/
const webHandlers = {};

const getContent = (template, method, callback)=>{
  pageCtrl.getContent(template, method).then((data)=>{
    
    callback(false, data.content, data.type);
  }, (err)=>{
    callback(404, err);
  });
}

/*--------------------------------------------------------------**
** Handler for getting the index page                           **
**--------------------------------------------------------------*/
webHandlers.index = function(data, callback){    
  getContent('index', data.method, callback);  
}

/*--------------------------------------------------------------**
** Handler for creating a new account                           **
**--------------------------------------------------------------*/
webHandlers.accountCreate = function(data,callback){ 
  getContent('accountCreate', data.method, callback);  
};

/*--------------------------------------------------------------**
** Showing the account created page                             **
**--------------------------------------------------------------*/
webHandlers.accountCreated = function(data,callback){    
  getContent('accountCreated', data.method, callback);  
};

/*--------------------------------------------------------------**
** Handler for creating a new session                           **
**--------------------------------------------------------------*/
webHandlers.sessionCreate = function(data,callback){    
  getContent('sessionCreate', data.method, callback);
};

/*--------------------------------------------------------------**
** Handler for editing an account                               **
**--------------------------------------------------------------*/
webHandlers.accountEdit = function(data,callback){        
  getContent('accountEdit', data.method, callback);
};

/*--------------------------------------------------------------**
** Handler for deleting a new session                           **
**--------------------------------------------------------------*/
webHandlers.sessionDeleted = function(data,callback){    
  getContent('sessionDeleted', data.method, callback);  
};

/*--------------------------------------------------------------**
** Handler for deleting an account                              **
**--------------------------------------------------------------*/
webHandlers.accountDeleted = function(data,callback){  
  getContent('accountDeleted', data.method, callback);  
};

/*--------------------------------------------------------------**
** Handler for creating a new check                             **
**--------------------------------------------------------------*/
webHandlers.checksCreate = function(data,callback){
  getContent('checksCreate', data.method, callback);  
};

/*--------------------------------------------------------------**
** Handler for viewing all user's checks                        **
**--------------------------------------------------------------*/
webHandlers.checksList = function(data,callback){  
  getContent('checksList', data.method, callback);  
};

/*--------------------------------------------------------------**
** Handler for editing an user's check                          **
**--------------------------------------------------------------*/
webHandlers.checksEdit = function(data,callback){    
  getContent('checksEdit', data.method, callback);  
};

/*--------------------------------------------------------------**
** Handler for getting the favicon as a public resource         **
**--------------------------------------------------------------*/
webHandlers.favicon = function(data, callback){
  // Reject any request that isn't a GET
  if(data.method !== 'get'){
    callback(405);
    return;
  }

  // Read in the favicon's data
  pageCtrl.getFavicon().then((data)=>{
    callback(false, data.content, data.type);
  }, (err)=>{
    callback(404);
  });    
  
}

/*--------------------------------------------------------------**
** Handler for getting resources from the public directory      **
**--------------------------------------------------------------*/
webHandlers.public = function(data, callback){
  // Reject any request that isn't a GET
  if(data.method !== 'get'){
    callback(405);
    return;
  }
  
  // Get the filename being requested
  let trimmedAssetName = data.path.replace('public/','').trim();
  pageCtrl.getPublicAsset(trimmedAssetName).then((data)=>{
    callback(false, data.content, data.type);
  }, (err)=>{
    callback(404);
  });
  
}

// Export the handlers for the webapp
module.exports = webHandlers;