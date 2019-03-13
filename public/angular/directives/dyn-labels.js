'use strict';
angular
  .module('app')
  .directive('dynLabels', dynLabels);

dynLabels.$inject = ['$filter','DataFactory'];

function dynLabels ($filter, DataFactory) {

  var directive =  {  
    transclude: false,
    scope:{      
      labels:"<",
      source:"<",
      completeLabel: "="
    }, 
    
    link: function(scope, element, attrs) {
           
      var renderLabel = function(source){
        var str = ""
        
        for(var key in scope.labels){
          var item =  scope.labels[key],             
          filterName = item.filter || '',
          val = (item.filter && filterName) ? $filter(filterName)(source[key]) : source[key]

          str += (item.label) ? item.label + ': ' + (val || '-') : '' + (val || '-')          
          if(item.separator) 
            str += item.separator          
        }
        return str
      }      

      for(var key in scope.labels){
        scope.$watch('source["'+ key +'"]', function (newValue, oldValue, scope){
          if(newValue)
            scope.completeLabel = renderLabel(scope.source)
        })
      }      

    }
  }
  return directive
}