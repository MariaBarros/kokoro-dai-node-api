'use strict';
function formConfigProvider () {
      var _languajes   =   [{language:'Español', code: 'es'},{language:'English', code: 'en'}],
        _formsPath = "public/forms";          
            
      this.setPathForm = function(value){
        _formsPath = value;
      }

      this.setLan = function(value){
        localStorage.setItem('lang', value)
      }      
            
      this.$get = function () {
        return {          
          pathForms: _formsPath,
          languajes: _languajes,
          lan: localStorage.getItem('lang')
        }
      }      
}

angular.module('app').provider('formConfig', formConfigProvider);