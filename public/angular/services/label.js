angular.module('app').factory('LabelsFactory', LabelsFactory);

LabelsFactory.$inject = ['$http', '$q'];

function LabelsFactory ($http, $q) {
    var _labelFactory = {}, _labels = {}     
                
    _labelFactory.getLabels = function(){        
        var deferred = $q.defer()
        if(_labels && Array.isArray(_labels)) return $q.when(_labels)
        $http.get('data/labels.json').then( (response) => {              
            _labels = response.data;
            deferred.resolve(_labels);
        })
        return deferred.promise;
    }        

    _labelFactory.getContentTemplate = function(item, collection="label"){
        var collection = _labels[collection];
        return collection[item];
    }
        
    return _labelFactory;
};

angular.module('app').factory('MessFactory', MessFactory);

function MessFactory () {
       
  var _messages = [], _messFactory = {};    

   _messFactory.add = function(message) {
      _messages = _messFactory.delete(message);
      _messages.push(message);
      return {processing: false, message: ""};      
    };   
   
    _messFactory.delete = function(message) {
    var index = _messages.indexOf(message);        
      _messages.splice(index, 1);
      return _messages;
    }; 

    _messFactory.clear = function(){ _messages = [] };

    _messFactory.list = function(){ return _messages };

    _messFactory.loading = function(mess=""){ return {processing:true, message: mess} };

    _messFactory.loaded = function(){ return {processing: false, message: ""} };

    return _messFactory;      
}