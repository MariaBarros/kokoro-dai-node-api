angular.module('kd-form')
  .factory('FormFactory', FormFactory);

FormFactory.$inject = ['$http','formConfig'];

function FormFactory ($http, formConfig) { 
   
  let _form = {};  

  _form.formName = function(formName){
    let form = document.querySelector( '[name="' + formName + '"]' ),
            scopeForm = angular.element( form ).scope();

    return (scopeForm) ? scopeForm[formName] : null
  }

  _form.reference = function($event, relation){
    let lastInsertId = ($event.response) ? parseInt($event.response.lastInsertId) : 0
    //Set id for lastInsert record
    if(lastInsertId > 0){
      if(relation && relation.id) $event.item[relation.id] = lastInsertId
      else $event.item.id = lastInsertId
    } 
    return $event.item
  }

  _form.getButtons = function(buttons = {}){    
    return {...formConfig.buttonsDefault, ...buttons};    
  };

  _form.request = function(optionRequest){
    // Merge optionRequest with default values
    let requestDefault = {
      headers: undefined, 
      path: '/',
      method: 'GET',
      queryStringObject: {},
      payload: {}    
    };

    let request = {...requestDefault, ...optionRequest};
    
    request.path = typeof(request.path) == "string" && request.path.length > 0 ? request.path : '/';
    request.payload = typeof(optionRequest.payload) == "object" ? request.payload : {};    

    // For each query string parameter sent, add it to the path
    let counter = 0,
    requestUrl = `${request.path}?`,
    queryStringObject = request.queryStringObject;
    
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
  
    let req = {method: request.method, 
      url: requestUrl, 
      headers: {'Content-Type': 'application/json'},
      data: optionRequest.payload || {}};        
       
    // Make the request, return a promise
    console.log(req)
    return $http(req);    
  }

  _form.updateCollection = function(item, collection = []){
    item.updated = true
    if(item.$index >= 0 || item.id) {
      if(item.$index) 
        collection[item.$index] = item  
      else{
        var index = -1;
        for (var i = 0; i < collection.length; i++) {
          if(collection[i].id == item.id)             
            index = i;
        }
        if(index < 0) 
          collection.push(item)
        else collection[index] = item
      }
    }else
        collection.push(item)

    item.selected = true
    return collection
  }

  /*------------------------------------------------------------------------------*/
  /* showIf function. Check if a criteria's collection is true                    */
  /*------------------------------------------------------------------------------*/
  /* @params: fields collection                                                   */
  /*------------------------------------------------------------------------------*/  
  _form.showIf = function(fields, item){
    let response = true
    for(let key in fields){      
      switch(fields[key].type){
        case "boolean":
          response = response && (item[key] == fields[key].value)
          break
        case "null":
          response = response && (item[key] == null || item[key] == undefined)
          break
        default:
          response = response && item[key]  
          break
      }      
    }
    return response
  } 
  return _form
}

angular.module('kd-form').factory('MessFormFactory', MessFormFactory);

function MessFormFactory () {
       
  var _messages = [], _messFactory = {};    

   _messFactory.add = function(message) {
      _messages = _messFactory.delete(message);
      _messages.push(message);
      return {processing: false, message: ""};      
    };   
   
    _messFactory.delete = function(message) {
    var index = _messages.indexOf(message);        
      _messages.splice(index, 1);
      return _messages;
    }; 

    _messFactory.clear = function(){ 
      _messages = [] 
    };

    _messFactory.list = function(){ 
      return _messages 
    };

    _messFactory.loading = function(mess = ""){ 
      return {processing:true, message: mess} 
    };

    _messFactory.loaded = function(){ 
      return {processing: false, message: ""} 
    };

    return _messFactory;      
};