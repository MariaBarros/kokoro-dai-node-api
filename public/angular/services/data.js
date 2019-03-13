angular.module('app').factory('DataFactory', DataFactory);
DataFactory.$inject = ['$http', '$filter', 'appConfig', '$q'];

function DataFactory ($http, $filter, appConfig, $q) {   
  let _data = {};
 
  _data.getParams = function($routeParams){
      return $filter('params')($routeParams);    
  };
  
  _data.setFormParams = function(params, item = {}){ 
    try{   
      for(let key in params){
        let el = params[key]      
        if(!el.value && ((item[key]) || el.reference)){        
          el.value = (!el.static) ? (item[key].value || item[key]) : (el.reference || '')        
        }      
      }
      return params;
    }catch(e){
      return params;
    }    
  }

  _data.getStringParams = function(params = [], item){
    let stringParams = "";
    params.map((el)=>{
      if(el.key && item && item[el.key]){
          let itemStr = "&" + el.key + "=" + (item[el.key].value ? item[el.key].value : item[el.key])
          if(item[el.key]) stringParams += itemStr
      }
    })
    return stringParams
  }

  _data.formatData = function(data){
    return $filter('paramFormat')(data)   
  }; 

  _data.request = function(optionRequest, data){
    // Merge optionRequest with default values
    optionRequest = setters.setRequest(optionRequest);    

    // For each query string parameter sent, add it to the path
    let requestUrl = setters.setRequestUrl(`${optionRequest.path}?`, optionRequest.queryStringObject);
    var deferred = $q.defer()
    let req = {method: optionRequest.method, 
      url: requestUrl, 
      headers: {'Content-Type': 'application/json'},
      data: data};        
    
    // Get token
    let sessionToken = appConfig.getSessionToken();
    if(sessionToken !== false){
      req.headers.token = sessionToken.tokenId
    }    
    // Make the request, return a promise
    return $http(req);    
  }

  _data.inCollection = function(collection, item){
    return collection.indexOf(item)
  }

  _data.filterCollection = function(collection, item, fieldCompare = 'id'){
    if(Array.isArray(collection)){
      return collection.filter((el)=>{
        if(el[fieldCompare] == item[fieldCompare]) return el
      })
    }    
  }
  
  _data.toggle = function(collection = [], item){
    var idx = _data.inCollection(collection, item)
    if (idx > -1) collection.splice(idx, 1)
    else collection.push(item)    
    return collection    
  }  

  _data.getJson = function(name){
    return $http.get(name+'.json')  
  }

  return _data;    
}