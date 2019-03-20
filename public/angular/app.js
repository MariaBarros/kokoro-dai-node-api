'use strict';

angular.module('app', [])

.config(function(appConfigProvider, formConfigProvider) {	
  //appProvider.setPathCtrl('server/controller/');  
  formConfigProvider.setLan('es');  
  formConfigProvider.setPathForm('public/forms');
});