'use strict';
function appConfigProvider () {
      var _languajes   =   [{language:'Español', code: 'es'},{language:'English', code: 'en'}],          
          _formsPath = "public/forms",          
          config       =   {sessionToken: false},
          _tabs        =   {};
      
      
      var _getCurrentTab = function(tabName, defaultTab){        
        if(!_tabs[tabName])
          _tabs[tabName] = {default: defaultTab, selected: defaultTab}
        return _tabs[tabName]
      };

      var _setCurrentTab = function(tabName, selected){        
        _tabs[tabName].selected = selected        
      };

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

      this.setLan = function(value){
        localStorage.setItem('lang', value)
      }      

      this.setPathForm = function(value){
        _formsPath = value;
      }
            
      this.$get = function () {
        return {          
          languajes: _languajes,
          lan: localStorage.getItem('lang'),      
          pathForms: _formsPath,          
          getCurrentTab: _getCurrentTab,
          getSessionToken: _getSessionToken,
          setToken: _setToken,
          sessionToken: config.sessionToken,
          setCurrentTab: _setCurrentTab
        }
      }      
}

angular.module('app').provider('appConfig', appConfigProvider);