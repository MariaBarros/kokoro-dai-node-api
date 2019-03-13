'use strict';
angular
  .module('app')
  .directive('matchValidator', matchValidator);
//Compare equals, greather than, less than
function matchValidator () {

  var directive =  {

    require: "ngModel",
        scope: {
            otherModelValue: "=matchValidator"
        },
        link: function(scope, element, attributes, ngModel) {
            
            ngModel.$validators.matchValidator = function(modelValue) { 
                
                if(attributes.compare=="greatherthan") return modelValue >= scope.otherModelValue;
                else{ 
                  if(attributes.compare=="lessthan") return modelValue <= scope.otherModelValue;
                  else return modelValue == scope.otherModelValue;
                }
            };            
 
            scope.$watch("otherModelValue", function() {
                ngModel.$validate();
            });
        }

  };

  return directive;

  ////////////  
}