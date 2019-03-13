angular.module('app')
  .factory('FormFactory', FormFactory);

FormFactory.$inject = ['$http'];

function FormFactory ($http) { 
   
  let _form = {};  

  _form.formName = function(formName){
    let form = document.querySelector( '[name="' + formName + '"]' ),
            scopeForm = angular.element( form ).scope();

    return (scopeForm) ? scopeForm[formName] : null
  }

  _form.reference = function($event, relation){
    let lastInsertId = ($event.response) ? parseInt($event.response.lastInsertId) : 0
    //Set id for lastInsert record
    if(lastInsertId > 0){
      if(relation && relation.id) $event.item[relation.id] = lastInsertId
      else $event.item.id = lastInsertId
    } 

    return $event.item
  }

  _form.mergeJson = function(item, obj = {}){
    if(!item) return item
    for(var key in obj){      
      if(key != "id" && key.length>1)
        item[key] = obj[key]      
    } 
    return item
  }

  _form.updateCollection = function(item, collection = []){
    item.updated = true
    if(item.$index >= 0 || item.id) {
      if(item.$index) 
        collection[item.$index] = item  
      else{
        var index = -1;
        for (var i = 0; i < collection.length; i++) {
          if(collection[i].id == item.id)             
            index = i;
        }
        if(index < 0) 
          collection.push(item)
        else collection[index] = item
      }
    }else
        collection.push(item)

    item.selected = true
    return collection
  }

  /*------------------------------------------------------------------------------*/
  /* showIf function. Check if a criteria's collection is true                    */
  /*------------------------------------------------------------------------------*/
  /* @params: fields collection                                                   */
  /*------------------------------------------------------------------------------*/  
  _form.showIf = function(fields, item){
    let response = true
    for(let key in fields){      
      switch(fields[key].type){
        case "boolean":
          response = response && (item[key] == fields[key].value)
          break
        case "null":
          response = response && (item[key] == null || item[key] == undefined)
          break
        default:
          response = response && item[key]  
          break
      }      
    }
    return response
  }
 
  return _form
}


angular.module('app')
  .factory('ValidatorFactory', ValidatorFactory);

ValidatorFactory.$inject = ['$http','$q','appConfig'];

function ValidatorFactory ($http, $q, appConfig) { 
   
  let _validator = {};  
  
  _validator.matchValidator = function(modelValue, compare, container){    

    if(!modelValue) return true    
    var compareValue = $('#'+container).val()
    if(compareValue) compareValue = compareValue.replace(":","")
    
    if(compareValue){      
      if(compare=="greatherthan") return parseInt(modelValue) >= parseInt(compareValue);
      else{           
          if(compare=="lessthan") return parseInt(modelValue) <= parseInt(compareValue);
          else return modelValue == compareValue;
      }

    }else return true
    
  }

  _validator.checkDuplicate = function(modelValue, attrs) {
    var collection = appConfig.pathCtl + attrs.collection + ".php",
        action = attrs.action,
        param = attrs.param + "=" + modelValue       
        
    if(!modelValue) return true    

    return $http.get(collection +'?action='+action+'&'+param)
                .then(function(response) {
                    var res = JSON.parse(response.data)
                    console.log(res)                
                    if (res.Cant>0) return $q.reject()            
                    return $q.resolve()
                  }, function(err)  {return $q.resolve()});   
  }

  _validator.dateValidator = function(modelValue, viewValue, attrs) {       
    if(!modelValue) return true
    var split =  viewValue.split('/'), 
        date = new Date(split[2]+"-"+split[1]+"-"+split[0])
    
    if(!date.getDate()) return false

    var max = (attrs.max == "today") ? new Date() : new Date(attrs.max), 
        min = (attrs.min) ? new Date(attrs.min) : null

    if(date <= max){
      if(min) return date>=min
      else return true
    }else
      return false
    
  } 
 
  return _validator;
}