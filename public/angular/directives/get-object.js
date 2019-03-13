'use strict';
angular
  .module('app')
  .directive('getObject', getObject);

getObject.$inject = ['DataFactory'];

function getObject (DataFactory) {

  var directive =  {
    require:"ngModel",    
    scope:{
      selection:"="      
    },
    link: function(scope, element, attr, ngModel) {
      var el = $(element[0]);

      el.on('blur', function(){       
        var val = ngModel.$modelValue,
          router = attr.router;
          if(val){
            scope.selection = {};           
            DataFactory.records(router + ".php",attr.action,"&search="+val).then( function(response){
              scope.selection = response
            })      
          }  
      })      
    }

  };
  return directive;
}