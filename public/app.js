/*--------------------------------------------------------------**
** Frontend Logic for application                               **
**--------------------------------------------------------------*/

// Container for frontend application
let app = {
  config: {'sessionToken': false}
};

// AJAX Client (for RESTful API)
app.client = {}

/*--------------------------------------------------------------**
** Interface for making API calls                               **
**--------------------------------------------------------------*/
app.client.request = function(optionRequest, callback){  
  // Combine optionRequest with default values
  optionRequest = setters.setRequest(optionRequest);
  callback = typeof(callback) == 'function' ? callback : false;  

  // For each query string parameter sent, add it to the path
  let requestUrl = setters.setRequestUrl(`${optionRequest.path}?`, optionRequest.queryStringObject);
  // Form the http request as a JSON type
  let xhr = setters.ajaxPrepare(requestUrl, optionRequest.method, optionRequest.headers, callback);

  // If there is a current session token set, add that as a header
  if(app.config.sessionToken)
    xhr.setRequestHeader("token", app.config.sessionToken.tokenId);

  // Send the payload as JSON
  let payloadString = JSON.stringify(optionRequest.payload);
  xhr.send(payloadString);
};


// Log the user out then redirect them
app.logUserOut = function(){  
  // Send the current token to the tokens endpoint to delete it
  let optionRequest = setters.requestToken('DELETE');  
  optionRequest.queryStringObject = {'id' : validators.isString(app.config.sessionToken.tokenId) ? app.config.sessionToken.tokenId : false};
  
  app.client.request(optionRequest, function(statusCode, responsePayload){    
    // Set the app.config token as false and send the user to the logged out page
    app.config.sessionToken = setters.setSessionToken(false);
    window.location = '/session/deleted';
  });
};

// Bind the forms
app.bindForms = function(){
  let allForms = document.querySelectorAll("form");

  for(var i = 0; i < allForms.length; i++){
    allForms[i].addEventListener("submit", function(e){
      // Stop it from submitting
      e.preventDefault();
      let formId = this.id,
        method = this._method && this._method.value ? this._method.value : this.method,
        optionRequest = setters.requestAction(this.action, method.toUpperCase());
      // Turn the inputs into a payload
      optionRequest.payload = setters.turnInputsIntoPayload({}, this.elements);

      // Hide the error message (if it's currently shown due to a previous error)
      document.querySelector(`#${formId} .formError`).style.display = 'hidden';      

      // Call the API
      app.client.request(optionRequest, function(statusCode, responsePayload){      
        // Display an error on the form if needed
        if(statusCode !== 200){
          app.formResponseError(formId, statusCode, responsePayload);
        } else {
          // If successful, send to form response processor                  
          app.formResponseProcessor(formId,optionRequest.payload,responsePayload);
        }
      });
    });
  }
};

// Display error on the form
app.formResponseError = function(formId, statusCode, response){
  if(statusCode == 403){
    // log the user out
    app.logUserOut();
  } else{
    // Try to get the error from the api, or set a default error message            
    let error = validators.isString(response.message) ? response.message : 'An error has occured, please try again';
    // Set the formError field with the error text
    setters.showError(`#${formId} .formError`, error);
  }
};

// Form response processor
app.formResponseProcessor = function(formId, requestPayload, responsePayload){    
  // If login was successful, set the token in localstorage and redirect the user
  if(formId == 'sessionCreate')
    app.config.sessionToken = setters.setSessionToken(responsePayload);

  // If the user just deleted their account, redirect them to the account-deleted page
  if(formId == 'accountDelete')
    app.logUserOut(false);
  else{
    let form = document.querySelector(`#${formId}`);
    let successMsg = document.querySelector(`#${formId} .formSuccess`);
    if(form){
      // If the form has success messages, show them      
      if(successMsg)
        successMsg.style.display = 'block';
      // If form has a callback page, redirect to it
      let redirect = form.getAttribute("callback-page");
      if(redirect)
        window.location = redirect;
    }  
  }  
};

// Get the session token from localstorage and set it in the app.config object
app.getSessionToken = function(){
  let tokenString = localStorage.getItem('token');
  if(validators.isString(tokenString)){
    try{
      let token = JSON.parse(tokenString);
      app.config.sessionToken = token;      
      setters.setLoggedInClass(validators.isObject(token));      
    }catch(e){
      app.config.sessionToken = false;
      setters.setLoggedInClass(false);
    }
  }
};

// Renew the token
app.renewToken = function(callback){
  let currentToken = validators.isObject(app.config.sessionToken) ? app.config.sessionToken : false;
  if(currentToken){
    // Update the token with a new expiration
    let optionRequest = setters.requestToken('PUT');
    optionRequest.payload = {
      'id' : currentToken.tokenId,
      'extend' : true,
    };
    app.client.request(optionRequest, function(statusCode, responsePayload){
      // Display an error on the form if needed
      if(statusCode == 200){
        // Get the new token details
        let queryStringObject = {'id' : currentToken.tokenId};
        app.client.request({'path': 'api/tokens', 'queryStringObject': queryStringObject}, function(statusCode, responsePayload){
          // Display an error on the form if needed
          let success = statusCode == 200;          
          app.config.sessionToken = setters.setSessionToken(success ? responsePayload : false);  
          callback(success);          
        });
      } else {        
        app.config.sessionToken = setters.setSessionToken(false);  
        callback(true);
      }
    });
  } else {
    app.config.sessionToken = setters.setSessionToken(false);
    callback(true);
  }
};

// Loop to renew token often
app.tokenRenewalLoop = function(){
  setInterval(function(){
    app.renewToken(function(err){
      if(!err){
        console.log("Token renewed successfully @ "+Date.now());
      }
    });
  },1000 * 60);
};

// Init (bootstrapping)
app.init = function(){
  // Bind all form submissions
  let form = document.querySelector("form");      
  if(form)    
    app.bindForms();  

  // Get the token from localstorage
  app.getSessionToken();
  // Renew token process
  app.tokenRenewalLoop();
};