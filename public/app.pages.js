/*--------------------------------------------------------------**
** Load data on the page                                        **
**--------------------------------------------------------------*/
app.loadDataOnPage = function(){
  // Get the current page from the body class
  let bodyClasses = document.querySelector("body").classList,
    primaryClass = typeof(bodyClasses[0]) == 'string' ? bodyClasses[0] : false;

  let pages = {};

  // Logic for account settings page
  pages.accountEdit = () =>{
    app.loadAccountEditPage();  
  };

  // Logic for dashboard page
  pages.checksList = () =>{
    app.loadChecksListPage();  
    // Put the hidden username field into the forms
    app.setUsernameFromToken(app.config.sessionToken); 
  };

  // Logic for check details page
  pages.checksEdit = () =>{
    app.loadChecksEditPage();
    // Put the hidden username field into the forms
    app.setUsernameFromToken(app.config.sessionToken);  
  };

  if(primaryClass && pages[primaryClass])
    pages[primaryClass]();
  
};

/*--------------------------------------------------------------**
** Load the account edit page specifically                      **
**--------------------------------------------------------------*/
app.loadAccountEditPage = function(){
  // Get the username from the current token, or log the user out if none is there  
  if(validators.isString(app.config.sessionToken.username)){
    // Fetch the user data
    let username  = app.config.sessionToken.username; 
    let fields = ['firstName', 'lastName', 'phone', 'username'];
    app.client.request({'path':'api/users','queryStringObject': {'id': username}}, function(statusCode, userData){
      if(statusCode == 200){
        // Put the data into the forms as values where needed
        app.setInputValues('accountEdit', fields, userData);        
        // Get username
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

/*--------------------------------------------------------------**
** Load the dashboard page specifically                         **
**--------------------------------------------------------------*/
app.loadChecksListPage = function(){
  // Get the current token
  app.getSessionToken();

  if(validators.isString(app.config.sessionToken.username)){
    // Fetch the user data
    let username = app.config.sessionToken.username;    
    app.client.request({'path':'api/users','queryStringObject': {'id': username}},function(statusCode, responsePayload){
      if(statusCode == 200){
        // Determine how many checks the user has
        let allChecks = validators.isObject(responsePayload.checks) && responsePayload.checks instanceof Array && responsePayload.checks.length > 0 ? responsePayload.checks : [];
        
        if(allChecks.length > 0){
          // Show each created check as a new row in the table
          allChecks.forEach(function(checkId){
            // Get the data for the check            
            app.client.request({'path':'api/checks','queryStringObject': {'id': checkId}}, function(statusCode, checkData){
              if(statusCode == 200 && checkData){
                // Make the check data into a table row                
                let state = validators.isString(checkData.state) ? checkData.state : 'unknown';
                let values = [checkData.method.toUpperCase(), `${checkData.protocol}://`, checkData.url, state, `<a href="/checks/edit?id=${checkData.id}">View / Edit / Delete</a>`];
                app.setTableValues("checksListTable", values);
              } else {
                console.log("Error trying to load check ID: ",checkId);
              }
            });
          });

          // Show the createCheck CTA if the user ckecks < 5
          if(allChecks.length < 5)
            document.getElementById("createCheckCTA").style.display = 'block';

        } else {
          // Show 'you have no checks' message
          document.getElementById("noChecksMessage").style.display = 'table-row';
          // Show the createCheck CTA
          document.getElementById("createCheckCTA").style.display = 'block';
        }
      } else
        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
        app.logUserOut();
    });
  } //else
    //app.logUserOut();
};

// Load the checks edit page specifically
app.loadChecksEditPage = function(){
  // Get the check id from the query string, if none is found then redirect back to dashboard
  let id = typeof(window.location.href.split('=')[1]) == 'string' && window.location.href.split('=')[1].length > 0 ? window.location.href.split('=')[1] : false;
  if(id){
    // Fetch the check data    
    app.client.request({'path':'api/checks','queryStringObject': {'id': id}}, function(statusCode, checkData){
      if(statusCode == 200){
        // Put the hidden id field into both forms
        let hiddenIdInputs = document.querySelectorAll("input.hiddenIdInput");
        let fields = ['id', 'state', 'protocol', 'url', 'method', 'timeoutSeconds'];
        for(let i = 0; i < hiddenIdInputs.length; i++){
            hiddenIdInputs[i].value = checkData.id;
        }

        // Put the data into the top form as values where needed
        app.setInputValues('checksEdit', fields, checkData);
        let successCodeCheckboxes = document.querySelectorAll("#checksEdit input.successCodesInput");
        for(let i = 0; i < successCodeCheckboxes.length; i++){
          if(checkData.successCodes.indexOf(parseInt(successCodeCheckboxes[i].value)) > -1)
            successCodeCheckboxes[i].checked = true;
        }
      } else {
        // If the request comes back as something other than 200, redirect back to dashboard
        window.location = '/checks/all';
      }
    });
  } else
    window.location = '/checks/all';
};

app.setUsernameFromToken = function(token){
  let hiddenUsernameInputs = document.querySelectorAll("input.hiddenUsernameInput");
  if(hiddenUsernameInputs){
    // Validate the token
    if(validators.isObject(token) && validators.isString(token.username)){
      for(let i = 0; i < hiddenUsernameInputs.length; i++)
        hiddenUsernameInputs[i].value = token.username;
    }
  }
};

app.setInputValues = function(container, fields, values){
  fields.forEach((field)=>{
    let fieldContainer = document.querySelector(`#${container} .${field}Input`);
    if(fieldContainer)
      fieldContainer.value = values[field];
    });
};

app.setTableValues = function(container, values){
  let table = document.getElementById(container);
  let tr = table.insertRow(-1);
  tr.classList.add('checkRow');
  for(let i = 0; i < values.length; i++){
    let td = tr.insertCell(i);
    td.innerHTML = values[i];
  }
};

/*--------------------------------------------------------------**
** Bind the logout button                                       **
**--------------------------------------------------------------*/
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