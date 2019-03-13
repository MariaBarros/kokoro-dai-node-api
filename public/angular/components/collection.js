function CollectionController () {  
  let filters;
  let currentCollection = [];
  
  this.$onChanges = () =>{
    if(this.collection){
      filters = this.filters
      let filterData = setters.multiFilter(this.collection);      
      switch(this.action){
        case "getOne":
            this.result = filterData[0];
            break;
        case "count":
            this.result = filterData.length;
            break;        
        case "in":
            this.result = filterData.length > 0            
            break;
        default:
            this.result = filterData;
      }      
    }
  }
};

function SelCompCtrl(DataFactory, MessFactory, appConfig) {
  this.size = 10;
  this.page = 1;
  let currentAction,
    currentParams = "-";

  /*------------------------------------------------------------------------------*/
  /* select function. Get collection                                              */
  /*------------------------------------------------------------------------------*/
  /* @params: router for get collection                                           */
  /*------------------------------------------------------------------------------*/
  this.select = router => {
    this.loading = MessFactory.loading("Loading...");    
    currentParams = this.params;
    DataFactory.request({path: router, queryStringObject: this.params}).then(
      response => {
        this.list = response.data;
        this.loading = MessFactory.loaded();
        if (this.onGet) this.onGet({ $event: { res: this.list } });        
      },
      error => {
        this.loading = MessFactory.add({ type: "danger", description: "Error al intentar recuperar los datos" });
      }
    );
  };

  /*------------------------------------------------------------------------------*/
  /* $onChanges function. Get or update collection                                */
  /*------------------------------------------------------------------------------*/
  /* @params: action for select collection,                                       */
  /* params string/object for filter collection                                   */
  /*------------------------------------------------------------------------------*/
  this.$onChanges = obj => {    
    this.select(this.router);
  };

  /*------------------------------------------------------------------------------*/
  /* toggle function. Add or remove an item into collection                       */
  /*------------------------------------------------------------------------------*/
  /* @params: collection, item                                                    */
  /*------------------------------------------------------------------------------*/
  this.toggle = (collection, item) => {
    return (collection = DataFactory.toggle(collection, item));
  };

  /*------------------------------------------------------------------------------*/
  /* getIds function. Get ids from selection                                      */
  /*------------------------------------------------------------------------------*/
  /* @params: collection, field                                                   */
  /*------------------------------------------------------------------------------*/
  this.getIds = (collection, field = "id") => {
    let ids = "";
    collection.map(el => {
      ids += ids != "" ? "," + el[field] : el[field];
    });
    return ids;
  };

  this.getLoguedUser = ()=>{
    return appConfig.sessionToken.username
  }

  this.clearFilter = collection => {
    collection.map(el => {
      el.selected = false;
    });
  };  
}

angular
.module('app')
.component('collectionComp', {  
  controller: CollectionController,
  bindings:{    
    collection: "<",
    action:"@", // getOne, count, search
    filters:"<", //{key: value}    / {key: {operator: ">=", value: 50}}
    result:"="
  }
})

.component("listComp", {
  controller: SelCompCtrl,
  bindings: {    
    params: "@",
    router: "@",
    onGet: "&?"
  }
})

.component("checkboxComp", {
  templateUrl: "public/angular/templates/checkbox.html",
  controller: SelCompCtrl,
  bindings: {    
    params: "@",
    router: "@",
    caption: "@",
    field: "@",
    item: "=?"
  }
});