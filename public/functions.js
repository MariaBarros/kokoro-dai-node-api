/*--------------------------------------------------------------**
** Util functions for application                               **
**--------------------------------------------------------------*/
let validators = {
  availableMethods: ['POST','GET','PUT','DELETE'],
  isObject: function(el){
    return typeof(el) == 'object' && el !== null
  },
  isString: function(el){
    return typeof(el) == 'string'
  }
};

let setters = {};

setters.setRequestUrl = function(requestUrl, queryStringObject){
  let counter = 0;
  queryStringObject = setters.getQueryString(queryStringObject);

  for(let queryKey in queryStringObject){
     if(queryStringObject.hasOwnProperty(queryKey)){
       counter++;
       // If at least one query string parameter has already been added, preprend new ones with an ampersand
       if(counter > 1){
         requestUrl += '&';
       }
       // Add the key and value
       requestUrl += `${queryKey}=${queryStringObject[queryKey]}`;
     }
  }
  return requestUrl;
};

setters.getHeader = function(headers){
  return validators.isObject(headers) ? headers : {};
}

setters.getQueryString = function(queryStringObject){
  return validators.isObject(queryStringObject) ? queryStringObject : {};
}

setters.getMethod = function(method){
  return validators.isString(method) && validators.availableMethods.indexOf(method.toUpperCase()) > -1 
    ? method.toUpperCase() : 'GET';
}

setters.ajaxPrepare = function(url, method, headers, callback){
  let xhr = new XMLHttpRequest();
  headers = setters.getHeader(headers);

  xhr.open(setters.getMethod(method), url, true);
  xhr.setRequestHeader("Content-type", "application/json");

  // For each header sent, add it to the request
  for(var headerKey in headers){
     if(headers.hasOwnProperty(headerKey))
       xhr.setRequestHeader(headerKey, headers[headerKey]);
  }  

  // When the request comes back, handle the response
  xhr.onreadystatechange = function() {
    if(xhr.readyState == XMLHttpRequest.DONE) {
      let statusCode = xhr.status;
      // Callback if requested
      if(callback){
        try{
          let parsedResponse = JSON.parse(xhr.responseText);
          callback(statusCode, parsedResponse);
        } catch(e){
          callback(statusCode,false);
        }
      }
    }
  };

  return xhr;
}

setters.showError = function(element, error){
  document.querySelector(element).innerHTML = error;
  // Show (unhide) the form error field on the form
  document.querySelector(element).style.display = 'block';
}

setters.setLoggedInClass = function(add){
  var target = document.querySelector("body");  
  if(add)
    target.classList.add('loggedIn');
  else
    target.classList.remove('loggedIn');
};

setters.turnInputsIntoPayload = function(payload, elements){  
  for(let i = 0; i < elements.length; i++){
    if(elements[i].type !== 'submit'){
      let classOfElement = typeof(elements[i].classList.value) == 'string' && elements[i].classList.value.length > 0 ? elements[i].classList.value : '';
      let valueOfElement = elements[i].type == 'checkbox' && classOfElement.indexOf('multiselect') == -1 ? elements[i].checked : classOfElement.indexOf('intval') == -1 ? elements[i].value : parseInt(elements[i].value);
      let elementIsChecked = elements[i].checked;
            
      // Override the method of the form if the input's name is _method
      let nameOfElement = elements[i].name;
      if(nameOfElement !== '_method'){
        // Create an payload field named "method" if the elements name is actually httpmethod
        if(nameOfElement == 'httpmethod'){
          nameOfElement = 'method';
        }
        // If the element has the class "multiselect" add its value(s) as array elements
        if(classOfElement.indexOf('multiselect') > -1){
          if(elementIsChecked){
            payload[nameOfElement] = typeof(payload[nameOfElement]) == 'object' && payload[nameOfElement] instanceof Array ? payload[nameOfElement] : [];
            payload[nameOfElement].push(valueOfElement);
          }
        } else {
          payload[nameOfElement] = valueOfElement;
        }
      }
    }
  }
  return payload;
}

setters.setRequest = function(options){
  let requestDefault = {
    headers: undefined, 
    path: '/',
    method: 'GET',
    queryStringObject: {},
    payload: {}    
  };

  let request = {...requestDefault, ...options};
  request.path = validators.isString(request.path) ? request.path : '/';
  request.payload = validators.isObject(request.payload) ? request.payload : {};

  return request;
}

setters.requestToken = function(method, payload){
  let options = {'path': 'api/tokens', 'method': method};
  if(payload && payload.username && payload.password)
    options.payload = {'username': payload.username, 'password': payload.password}

  return options;
}

setters.requestAction = function(action, method){
  return {'path': action, 'method': method};
}

// Set the session token in the app.config object as well as localstorage
setters.setSessionToken = function(token){
  //app.config.sessionToken = token;
  var tokenString = JSON.stringify(token);
  localStorage.setItem('token', tokenString);  
  setters.setLoggedInClass(validators.isObject(token));  
  return token;
};