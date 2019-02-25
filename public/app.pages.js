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

    // Logic for dashboard page
    if(primaryClass == 'checksList'){
      app.loadChecksListPage();
    }

    // Logic for check details page
    if(primaryClass == 'checksEdit'){
      app.loadChecksEditPage();
    }

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
    app.client.request({'path':'api/users','queryStringObject': queryStringObject}, function(statusCode, responsePayload){      
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

/*--------------------------------------------------------------**
** Load the dashboard page specifically                         **
**--------------------------------------------------------------*/
app.loadChecksListPage = function(){
  // Get the phone number from the current token, or log the user out if none is there  
  if(validators.isString(app.config.sessionToken.username)){
    // Fetch the user data
    let queryStringObject = {
      'id' : app.config.sessionToken.username
    };
    app.client.request({'path':'api/users','queryStringObject':queryStringObject},function(statusCode, responsePayload){
      if(statusCode == 200){
        // Determine how many checks the user has
        let allChecks = validators.isObject(responsePayload.checks) && responsePayload.checks instanceof Array && responsePayload.checks.length > 0 ? responsePayload.checks : [];
        
        if(allChecks.length > 0){
          // Show each created check as a new row in the table
          allChecks.forEach(function(checkId){
            // Get the data for the check
            let newQueryStringObject = {
              'id' : checkId
            };
            app.client.request({'path':'api/checks','queryStringObject': newQueryStringObject}, function(statusCode, responsePayload){
              if(statusCode == 200){
                let checkData = responsePayload;
                // Make the check data into a table row
                let table = document.getElementById("checksListTable");
                let tr = table.insertRow(-1);
                tr.classList.add('checkRow');
                let td0 = tr.insertCell(0);
                let td1 = tr.insertCell(1);
                let td2 = tr.insertCell(2);
                let td3 = tr.insertCell(3);
                let td4 = tr.insertCell(4);
                td0.innerHTML = responsePayload.method.toUpperCase();
                td1.innerHTML = responsePayload.protocol+'://';
                td2.innerHTML = responsePayload.url;
                let state = validators.isString(responsePayload.state) ? responsePayload.state : 'unknown';
                td3.innerHTML = state;
                td4.innerHTML = '<a href="/checks/edit?id='+responsePayload.id+'">View / Edit / Delete</a>';
              } else {
                console.log("Error trying to load check ID: ",checkId);
              }
            });
          });

          if(allChecks.length < 5){
            // Show the createCheck CTA
            document.getElementById("createCheckCTA").style.display = 'block';
          }

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
  } else
    app.logUserOut();
};

// Load the checks edit page specifically
app.loadChecksEditPage = function(){
  // Get the check id from the query string, if none is found then redirect back to dashboard
  let id = typeof(window.location.href.split('=')[1]) == 'string' && window.location.href.split('=')[1].length > 0 ? window.location.href.split('=')[1] : false;
  if(id){
    // Fetch the check data
    let queryStringObject = {
      'id' : id
    };
    app.client.request({'path':'api/checks','queryStringObject': queryStringObject}, function(statusCode, responsePayload){
      if(statusCode == 200){
        // Put the hidden id field into both forms
        var hiddenIdInputs = document.querySelectorAll("input.hiddenIdInput");
        for(var i = 0; i < hiddenIdInputs.length; i++){
            hiddenIdInputs[i].value = responsePayload.id;
        }

        // Put the data into the top form as values where needed
        document.querySelector("#checksEdit1 .displayIdInput").value = responsePayload.id;
        document.querySelector("#checksEdit1 .displayStateInput").value = responsePayload.state;
        document.querySelector("#checksEdit1 .protocolInput").value = responsePayload.protocol;
        document.querySelector("#checksEdit1 .urlInput").value = responsePayload.url;
        document.querySelector("#checksEdit1 .methodInput").value = responsePayload.method;
        document.querySelector("#checksEdit1 .timeoutInput").value = responsePayload.timeoutSeconds;
        let successCodeCheckboxes = document.querySelectorAll("#checksEdit1 input.successCodesInput");
        for(let i = 0; i < successCodeCheckboxes.length; i++){
          if(responsePayload.successCodes.indexOf(parseInt(successCodeCheckboxes[i].value)) > -1)
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
      for(var i = 0; i < hiddenUsernameInputs.length; i++)
        hiddenUsernameInputs[i].value = token.username;
    }
  }
}

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