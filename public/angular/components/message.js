function MCtr (MessFactory) {   
  /* Delete message */
  this.closeMessage = (m)   => {  this.messages = MessFactory.delete(m)}
  /* Component Lifecicle */
  this.$onInit      = ()    => {  this.messages = MessFactory.list()   } 

}

angular.module('app')
.component('messComp', {
  templateUrl: 'public/angular/templates/messages.html',
  controller: MCtr
})

.component('loadingComp',{
  templateUrl: 'public/angular/templates/loading.html',    
    bindings:{
      loading : "=",
      message:"<",
      loadClass:"@"
    }
});