angular
  .module('app')
  .directive('duplicateValidator', duplicateValidator);

function duplicateValidator ($http, $q, appConfig) {

  var directive =  {

    require: "ngModel",
    
        link: function(scope, element, attrs, ngModel) {
             
            ngModel.$asyncValidators.duplicateValidator = function(modelValue) {
                
                var validate = scope.$eval(attrs.duplicateValidator),
                  collection = attrs.collection,
                  action = attrs.action,
                  param = attrs.name,
                  object = appConfig.pathCtl + collection + ".php";

                if(validate === false) return $q.resolve()

                return $http.get(object+'?action='+action+'&'+param+'='+modelValue).then(     
                  function(response) {
                    var res = JSON.parse(response.data)                
                    if (res.Cant>0) return $q.reject('user already exist')            
                    return $q.resolve()
                  }, function(err)  {return $q.resolve()});                
                      
            };
             
        }

  };

  return directive;

  ////////////  
}