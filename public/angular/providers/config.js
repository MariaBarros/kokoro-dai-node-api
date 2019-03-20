'use strict';
function appConfigProvider () {
      var config       =   {sessionToken: false};      

      var _getSessionToken = function(){        
        let tokenString = localStorage.getItem('token');
        if(validators.isString(tokenString)){
          try{
            let token = JSON.parse(tokenString);
            config.sessionToken = token;                  
            return config.sessionToken;
          }catch(e){
            config.sessionToken = false;            
            return config.sessionToken;
          }
        }
      };

      let _setToken = function(token){
        config.sessionToken = token;
        var tokenString = JSON.stringify(token);
        localStorage.setItem('token', tokenString);        
      }      
      
      this.$get = function () {
        return {                    
          getSessionToken: _getSessionToken,
          setToken: _setToken,
          sessionToken: config.sessionToken          
        }
      }      
}

angular.module('app').provider('appConfig', appConfigProvider);