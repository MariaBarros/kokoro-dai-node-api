angular
.module('app')
.component("authComp", {
  templateUrl:"public/angular/templates/auth.html",
  controller: function(appConfig){
    this.auth = (response) =>{
      if(response.data.tokenId){
        app.config.sessionToken = setters.setSessionToken(response.data);                
        setters.setLoggedInClass(validators.isObject(response.data)); 
        window.location = "checks/all"
      }        
    }
  }  
})
.component("authUser",{
  controller: function(appConfig){
    this.$onInit = ()=>{
      let sessionToken = appConfig.getSessionToken();      
      this.user = sessionToken.username
    }
  },
  bindings:{
    user: "="
  }
});