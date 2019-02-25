/*--------------------------------------------------------------**
** Load data on the page                                        **
**--------------------------------------------------------------*/
app.loadDataOnPage = function(){
  // Get the current page from the body class
  let bodyClasses = document.querySelector("body").classList,
    primaryClass = typeof(bodyClasses[0]) == 'string' ? bodyClasses[0] : false;

  // Logic for account settings page
  if(primaryClass == 'accountEdit'){
    app.loadAccountEditPage();  
  }else{
    // Put the hidden username field into the forms
    app.setUsernameFromToken(app.config.sessionToken);  
  }  
};

/*--------------------------------------------------------------**
** Load the account edit page specifically                      **
**--------------------------------------------------------------*/
app.loadAccountEditPage = function(){
  // Get the username from the current token, or log the user out if none is there  
  if(validators.isString(app.config.sessionToken.username)){
    // Fetch the user data
    let queryStringObject = {
      'id' : app.config.sessionToken.username
    };
    app.client.request({'path':'api/users','method': 'GET','queryStringObject': queryStringObject}, function(statusCode, responsePayload){      
      if(statusCode == 200){
        // Put the data into the forms as values where needed
        document.querySelector("#accountEdit1 .firstNameInput").value = responsePayload.firstName;
        document.querySelector("#accountEdit1 .lastNameInput").value = responsePayload.lastName;
        document.querySelector("#accountEdit1 .phoneInput").value = responsePayload.phone;
        document.querySelector("#accountEdit1 .usernameInput").value = responsePayload.username;        

        app.setUsernameFromToken(app.config.sessionToken);

      } else {
        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
        app.logUserOut();
      }
    });
  } else {
    app.logUserOut();
  }
};

app.setUsernameFromToken = function(token){
  let hiddenUsernameInputs = document.querySelectorAll("input.hiddenUsernameInput");
  if(hiddenUsernameInputs){
    // Validate the token
    if(validators.isObject(token) && validators.isString(token.username)){
      for(var i = 0; i < hiddenUsernameInputs.length; i++){
        hiddenUsernameInputs[i].value = token.username;
      }
    }
  }
}

// Bind the logout button
app.bindLogoutButton = function(){
  document.getElementById("logoutButton").addEventListener("click", function(e){
    // Stop it from redirecting anywhere
    e.preventDefault();
    // Log the user out
    app.logUserOut();
  });
};


/*--------------------------------------------------------------**
** Call the init processes after the window loads               **
**--------------------------------------------------------------*/
window.onload = function(){
  app.init();
  let  logoutBtn = document.getElementById("logoutButton");

  if(logoutBtn)
    // Bind logout logout button
    app.bindLogoutButton();
    
  // Load data on page
  app.loadDataOnPage();
};