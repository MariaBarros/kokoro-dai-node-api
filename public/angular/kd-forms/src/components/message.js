angular.module('kd-form')
.component('messComp', {
  template: `<div ng-repeat="message in $ctrl.messages">
              <div class="alert alert-{{message.type}} 
                text-center mess-comp" id="mess_{{$index}}" role="alert">     
                <span class="glyphicon" 
                  ng-class="{'glyphicon-ok-sign': mess.type=='success', 
                  'glyphicon-exclamation-sign': mess.type=='danger'}">
                </span> 
                {{message.description}}      
              </div>  
            </div>`,
  controller: function(MessFormFactory){
    /* Delete message */
    this.closeMessage = (m)   => {  
      this.messages = MessFormFactory.delete(m)
    };

    /* Component Lifecicle */
    this.$onInit      = ()    => {  
      this.messages = MessFormFactory.list()  
    };
  }
});