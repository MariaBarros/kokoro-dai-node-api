'use strict';
angular
  .module('app')
  .directive('dynAttrs', dynAttrs);

dynAttrs.$inject = ['$compile','ValidatorFactory'];

function dynAttrs ($compile, ValidatorFactory) {

  var directive =  {
    require: "ngModel",
    
    link: function(scope, element, attrs,ngModel) {    
      var el = element[0],
      parent = scope.$parent.$parent,
      dyns = (parent.$ctrl.field.dyns) ? parent.$ctrl.field.dyns : [];

      if(el && Array.isArray(dyns)){

        //Add attributes        
        dyns.map(function(a){
          el.removeAttribute(a.name);
          //el.attribute(a.name,a.value);                    
          el.setAttribute(a.name, a.value);

          if(a.name == "match-validator") 
            scope.matchCompare = a.value
          if(a.name == "compare") 
            scope.compare = a.value
          if(a.name == "date-validator") 
            scope.dateValidator = a.value          
          if(a.name == "check-duplicate") 
            scope.checkDuplicate = a.value
          if(a.name =="ng-model-options") 
            ngModel.$options = a.value
        })

        el.removeAttribute("dyn-attrs");        
        $compile(el)(scope);        
        
        //Validators
        if(scope.matchCompare){          
          ngModel.$validators.matchValidator = function(modelValue, viewValue){             
            return ValidatorFactory.matchValidator(modelValue, scope.compare, scope.matchCompare)
          }
        }
        if(scope.checkDuplicate){
         ngModel.$validators.checkDuplicate = function(modelValue, viewValue){            
            return (!attrs.itemId && ngModel.$valid) ? ValidatorFactory.checkDuplicate(modelValue, scope.checkDuplicate) : true
          } 
        }
        if(scope.dateValidator){
         ngModel.$validators.dateValidator = function(modelValue, viewValue){            
            return (ngModel.$valid) ? ValidatorFactory.dateValidator(modelValue, viewValue, scope.dateValidator) : true
          } 
        }
        
      }
      
    }

  };
  return directive;
}