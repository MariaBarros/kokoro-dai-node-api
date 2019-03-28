function FormCompCtrl($http, formConfig, FormFactory) {  
  /*------------------------------------------------------------------------------*/
  /* Finish function. It executes after saving the item                           */
  /*------------------------------------------------------------------------------*/
  /* @param {Object} item saved; {Object} res: save response                      */
  /*------------------------------------------------------------------------------*/
  let finish = (item, res = null) => {
    if (res && res.lastInsertId && res.lastInsertId > 0)
      item.id = res.lastInsertId;

    if (this.onSave) this.onSave({ $event: { item: item, response: res } });
      this.close();
  },
  /*------------------------------------------------------------------------------*/
  /* doAction function. It executes when the user clicks on OK button             */
  /*------------------------------------------------------------------------------*/
  /* @param {Object} item: form data                                              */
  /*------------------------------------------------------------------------------*/
  doAction = (item) => {
    item = FormFactory.mergeJson(item, this.sections);
    this.options.request.payload = this.item;
    FormFactory.request(this.options.request).then(
      res => finish(item, res)
    );
  };
  
  /*------------------------------------------------------------------------------*/
  /* Check if the form is multilingual and get the form's fields                  */
  /*------------------------------------------------------------------------------*/
  this.$onInit = () => {
    this.lan = formConfig.lan;
    this.languages = formConfig.languajes;
    // Get form's fields
    $http.get(`${formConfig.pathForms}/${this.formName}.json`).then(
        response => this.fields = response.data.fields
    );
    // Set form buttons    
    this.buttons = FormFactory.getButtons(this.options.buttons);
  };

  /*------------------------------------------------------------------------------*/
  /* Add function: Add or update an item into collection                          */
  /* It's called when a collection component is used                              */
  /*------------------------------------------------------------------------------*/
  /* @params $event: item for add or update and save response, collection         */
  /*------------------------------------------------------------------------------*/
  this.add = ($event, collection, relation) => {
    $event.item = FormFactory.reference($event, relation);
    return FormFactory.updateCollection($event.item, collection);
  };

  /*------------------------------------------------------------------------------*/
  /* Save (add or update) and select an item. It returns the item's id            */
  /* It's called when a select component is used                                  */
  /*------------------------------------------------------------------------------*/
  /* @params $event: item for add or update and save response, collection         */
  /*------------------------------------------------------------------------------*/
  this.select = ($event, collection, relation) => {
    $event.item = FormFactory.reference($event, relation);
    collection = FormFactory.updateCollection($event.item, collection);
    return $event.item[relation.id];
  };

  /*------------------------------------------------------------------------------*/
  /* Send a request to the server if the form is valid                            */
  /*------------------------------------------------------------------------------*/  
  this.submitForm = () => {
    // Get form name from DOM
    if (!this.form) 
      this.form = FormFactory.formName(this.formName);

    if (this.form.$$parentForm.$name) 
      this.form.$$parentForm.$submitted = false;

    if (this.form.$valid) {
      if (this.options.request && this.options.request.path)        
        doAction(this.item);
      else 
        finish(this.item);
    }
  };

  /*------------------------------------------------------------------------------*/
  /* Close function. Close the form and redirect if the redirect option is true   */
  /*------------------------------------------------------------------------------*/
  this.close = () => {
    if (this.open) 
      this.open = false;

    if (this.onCancel) this.onCancel();
  };

  /*------------------------------------------------------------------------------*/
  /* Redirect function. It's called when cancel the form operation                */
  /*------------------------------------------------------------------------------*/
  this.redirect = () => {
    this.close();
  };  
}

function FieldFormCtrl($http, FormFactory, formConfig) {
  this.operation = { edit: false, selected: {} };
  this.permission = { require: false };

  this.getTpl = ()=>{
    return `${formConfig.formTplPath}/${this.fieldType}.html`;
  }

  /*------------------------------------------------------------------------------*/
  /* GestSection Function: Get the section's fields                               */
  /*------------------------------------------------------------------------------*/
  /* @params: section JSON file that contains the fields collection               */
  /*------------------------------------------------------------------------------*/
  let getSection = section => {
    let sectionName = `${formConfig.pathForms}/Sections/${section.source}.json`;
    $http.get(sectionName).then(
      response => { section.fields = response.data; }
    );
  };
    
  this.$onInit = () => {    
    /*----------------------------------------------------------------*/
    /* Get the nested form and its params                             */
    /*----------------------------------------------------------------*/
    if (this.field.nestedForm) this.nestedForm = this.field.nestedForm;
    /*----------------------------------------------------------------*/
    /* Get the field's options, collection or object                  */
    /*----------------------------------------------------------------*/
    if (this.field.options) this.options = this.field.options;

    if (this.field.collection) this.collection = this.parent.item[this.field.collection];

    if (this.field.object) this.object = this.field.object;

    /*----------------------------------------------------------------*/
    /* Get the field's sections                                       */
    /*----------------------------------------------------------------*/
    if (this.field.sections)
      this.field.sections.map(section => {
        if (section.source) getSection(section);
      });
  };

  /*------------------------------------------------------------------------------*/
  /* Change the boolean value                                                     */
  /*------------------------------------------------------------------------------*/
  /* @params: field field name; callback function (optional)                      */
  /*------------------------------------------------------------------------------*/
  this.changeState = (field, callback = null) => {
    this.item[field] =
      this.item[field] == true || this.item[field] == 1 ? false : true;    
  };

  /*------------------------------------------------------------------------------*/
  /* Add or remove an item into collection                                        */
  /*------------------------------------------------------------------------------*/
  /* @params: collection, item                                                    */
  /*------------------------------------------------------------------------------*/
  this.getItemCollection = () => {
    let id = this.item;
    let filter = this.collection.filter((el)=>el.id == id);
    if(filter && Array.isArray(filter))
      return filter[0];
  };

  /*------------------------------------------------------------------------------*/
  /* showIf function. Check if a criteria's collection is true                    */
  /*------------------------------------------------------------------------------*/
  /* @params: fields collection                                                   */
  /*------------------------------------------------------------------------------*/
  this.showIf = fields => {
    return fields ? FormFactory.showIf(fields, this.item) : true;
  };
}

angular
  .module("kd-form")
  .component("formComp", {
    templateUrl: function(formConfig){
      return `${formConfig.formTplPath}/../form.html`;
    },
    controller: FormCompCtrl,
    bindings: {
      formName: "@",
      options: "<", //redirect: true/false, saveBefore: true/false, urlCancel, urlRedirect, router
      open: "=?",
      item: "=?",
      onSave: "&?",
      onCancel: "&?"
    }
  })
  .component("fieldFormComp", {
    template: "<span ng-include='$ctrl.getTpl()'></span>",
    controller: FieldFormCtrl,
    bindings: {
      fieldType: "@",
      name: "@",
      field: "<",
      item: "="
    },
    require: {
      parent: "^^formComp"
    }
  });