'use strict';
function formConfigProvider () {
      let _languajes   =   [{language:'Español', code: 'es'},{language:'English', code: 'en'}],
        _formsPath = "public/forms",
        _formTempPath = "public/angular/templates/forms",
        _buttonsDefault = {
          submit: {class: 'cta blue', label: 'Save'},
          cancel: {class: 'cta gray', label: 'Cancel'},
          links:[]
        };

      this.setPathForm = function(value){
        _formsPath = value;
      }

      this.setTplPathForm = function(value){
        _formTempPath = value;
      }

      this.setLan = function(value){
        localStorage.setItem('lang', value)
      }      
            
      this.$get = function () {
        return {          
          pathForms: _formsPath,
          formTplPath: _formTempPath,
          languajes: _languajes,
          buttonsDefault: _buttonsDefault,
          lan: localStorage.getItem('lang')
        }
      }      
}

angular.module('kd-form',[]);
angular.module('kd-form').provider('formConfig', formConfigProvider);