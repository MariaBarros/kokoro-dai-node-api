'use strict';
angular
  .module('kd-form')
  .directive('dynAttrs', dynAttrs);

dynAttrs.$inject = ['$compile','ValidatorFactory'];

function dynAttrs ($compile, ValidatorFactory) {

  var directive =  {
    require: "ngModel",    
    link: function(scope, element, attrs, $ctrl) {    
      var el = element[0],
      parent = scope.$parent,
      dyns = (parent.$ctrl.field && parent.$ctrl.field.dyns) ? parent.$ctrl.field.dyns : [];      

      if(el && Array.isArray(dyns)){

        //Add attributes        
        dyns.map(function(a){
          el.removeAttribute(a.name);
          //el.attribute(a.name,a.value);                    
          el.setAttribute(a.name, a.value);

          if(a.name == "match-value") 
            scope.matchValue = a.value
          if(a.name == "compare") 
            scope.compare = a.value
          if(a.name == "date-validator") 
            scope.dateValidator = a.value          
          if(a.name == "check-duplicate") 
            scope.checkDuplicate = a.value
          if(a.name =="ng-model-options")
            $ctrl.$options = a.value
        })
        
        el.removeAttribute("dyn-attrs");
        el.removeAttribute("dyns");
        //$compile(el)(scope);                    

        //Validators
        if(scope.compare){          
          $ctrl.$validators.matchValue = function(modelValue, viewValue){            
            if(!modelValue)
              return true;
            
            var res = ValidatorFactory.matchValidator(modelValue, scope.compare, scope.matchValue);            
            return res;
          }
        }
        if(scope.checkDuplicate){
         $ctrl.$asyncValidators.checkDuplicate = function(modelValue, viewValue){
            if(attrs.itemId || !$ctrl.$valid)
              return true

            return ValidatorFactory.checkDuplicate(modelValue, scope.checkDuplicate);                        
          } 
        }
        if(scope.dateValidator){
         $ctrl.$validators.dateValidator = function(modelValue, viewValue){            
            return ($ctrl.$valid) ? ValidatorFactory.dateValidator(modelValue, viewValue, scope.dateValidator) : true
          } 
        }
              
      }      
    }
  };
  return directive;
};

angular.module('kd-form')
  .factory('ValidatorFactory', ValidatorFactory);

ValidatorFactory.$inject = ['$q','FormFactory'];

function ValidatorFactory ($q, FormFactory) { 
   
  let _validator = {};  
  
  _validator.matchValidator = function(modelValue, compare, container){    

    var selector = document.querySelector(`#${container}`);
    if(!selector)
      return false;

    var compareValue = selector.value;    

    if(!compareValue)
      return false
    
    if(compare=="greatherthan") 
      return parseInt(modelValue) >= parseInt(compareValue);
    else{           
      if(compare=="lessthan") 
        return parseInt(modelValue) <= parseInt(compareValue);
      else{        
        return modelValue == compareValue;
      }
    }
  };

  _validator.checkDuplicate = function(modelValue, attrs) {
    var path = attrs.path,
        param = attrs.param,
        queryStringObject = {};

    if(!path || path =="/?") 
      return $q.resolve();    

    queryStringObject[param] = modelValue;
        
      return $q(function(resolve, reject){
        FormFactory.request({
        path: path,
        method: 'GET',
        queryStringObject: queryStringObject
      }, attrs.token).then(function () {
          var res = JSON.parse(response.data)          
          if (res[0]){ 
            reject({status: 406, statusText: "Duplicated"})
          }else{
            resolve({status: 200, statusText: "Not duplicated"})
          }
        }, function (err) {
          reject({status: err.status, statusText: err.statusText});
        });
    });
        
  }

  _validator.dateValidator = function(modelValue, viewValue, attrs) {       
    if(!modelValue) 
      return true
    
    var split =  viewValue.split('/'), 
        date = new Date(split[2]+"-"+split[1]+"-"+split[0])
    
    if(!date.getDate())
      return false

    var max = (attrs.max == "today") ? new Date() : new Date(attrs.max), 
        min = (attrs.min) ? new Date(attrs.min) : null

    if(date <= max){
      return (min) ? data >= min : true      
    }else
      return false
    
  } 
 
  return _validator;
};