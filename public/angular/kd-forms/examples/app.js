'use strict';

angular.module('app', ['kd-form'])
.factory('authInterceptor', function() {
  return {
    request : function(config) {
      config.headers.token = 'XXX-XXX-XXX';      
      return config;
    }
  };
})
.factory('responseInterceptor', function() {
  return {
    response : function(res) {
    	var time = res.config.responseTimestamp - res.config.requestTimestamp;    	
    	console.log(`The request for ${res.config.url} took ${(time / 1000)} seconds.`);
      	return res;
    }
  };
})
.factory('timestampMarker', [function() {  
    var timestampMarker = {
        request: function(config) {
            config.requestTimestamp = new Date().getTime();
            return config;
        },
        response: function(response) {
            response.config.responseTimestamp = new Date().getTime();
            return response;
        }
    };
    return timestampMarker;
}])
.factory('retryInterceptor', function($q, $injector, MessFormFactory) {
  return {
    responseError: function(rejection) {
    	console.log(rejection)
    	MessFormFactory.add({type: "danger", description: `Error ${rejection.status}: ${rejection.config.url} ${rejection.statusText}`})

      if (rejection.status !== 503) 
      	return $q.reject(rejection);
      if (rejection.config.retry) {
        rejection.config.retry++;
      } else {
        rejection.config.retry = 1;
      }

      if (rejection.config.retry < 2) {
        return $injector.get('$http')(rejection.config);
      } else {
        return $q.reject(rejection);
      }
    }
  };
})
.config(function($httpProvider, formConfigProvider) {	  
 	$httpProvider.interceptors.push('authInterceptor');
 	$httpProvider.interceptors.push('responseInterceptor');
 	$httpProvider.interceptors.push('retryInterceptor');
 	$httpProvider.interceptors.push('timestampMarker');
  	formConfigProvider.setLan('es');  
  	formConfigProvider.setPathForm('forms');
  	formConfigProvider.setTplPathForm('templates/forms');
});