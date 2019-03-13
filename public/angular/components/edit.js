function ICompCtrl(DataFactory, MessFactory, $route){  
  this.delete = (id)=>{    
    let router = this.parent.router + ".php"   
    DataFactory.delete(router,id).then( (response)=> {                      
      var res = JSON.parse(response.data)       
      if(res.code==200){
        MessFactory.add({type:"success", description: "La operación se realizó con éxito"})
        this.go()
      }else
        MessFactory.add({type:"danger", description: "Error al intentar eliminar el registro"})
    },(err) => 
      MessFactory.add({type:"danger", description: "Error al intentar eliminar el registro"})
    )
  }

  this.go = ()=>{
    this.open = false
    if(!this.onDelete)
      $route.reload()        
    else
      this.onDelete()
  }  
};


angular
.module('app')
.component("dateComp", {
  controller: function() {
    this.$onInit = () => {
      if (this.action == "getToday"){
        let date = new Date();
        this.item = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());        
      }
      if (this.action == "convert"){          
        let date = new Date(this.item)
        this.item = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());        
      }        
    };
  },
  bindings: {
    action: "@",
    item: "="
  }
})

.component('deleteComp', {
  templateUrl:"public/angular/templates/dialog-delete.html", 
  controller: ICompCtrl,
  bindings:{    
    title:"@",    
    item:"<",
    fields:"<",
    open:"=",
    onDelete: "&?"
  },require: {
    parent: '^^listComp'
  }
});