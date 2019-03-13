function FormCompCtrl($location, appConfig, DataFactory, FormFactory, MessFactory) {
  /*------------------------------------------------------------------------------*/
  /* Get form's fields                                                            */
  /*------------------------------------------------------------------------------*/
  /* @params {String} formName: form's name, json file                            */
  /*------------------------------------------------------------------------------*/
  let getForm = formName => {
      this.loading = MessFactory.loading("Loading...");
      DataFactory.getJson(formName).then(
        response => {
          this.fields = response.data.fields;
          this.cancelEnabled = response.data.hidden_cancel;
          this.loading = MessFactory.loaded();          
        },
        error =>{
          this.loading = MessFactory.add({type: "danger", description: "Error when loading the form"})
        }
      );
    },
    /*------------------------------------------------------------------------------*/
    /* Finish function. It executes after saving the item                           */
    /*------------------------------------------------------------------------------*/
    /* @param {Object} item saved; {Object} res: save response                      */
    /*------------------------------------------------------------------------------*/
    finish = (item, res = null) => {
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
      this.loading = MessFactory.loading("Processing...");
      DataFactory.request(this.options.request, this.item).then(
        res => {          
          console.log(res);          
          finish(item, res);
          MessFactory.add({ type: "success", description: "Success!"});          
        },
        err => {                    
          this.loading = MessFactory.add({ type: "danger", description: `Error: ${err.statusText}. ${err.data.Error}`});          
        }
      );
    };
  
  /*------------------------------------------------------------------------------*/
  /* Check if the form is multilingual and get the form's fields                  */
  /*------------------------------------------------------------------------------*/
  this.$onInit = () => {
    this.lan = appConfig.lan;
    this.languages = appConfig.languajes;
    getForm(appConfig.pathForms + "/" + this.formName);
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

  //Save (add or update) and select an item. It returns the item's id
  /*------------------------------------------------------------------------------*/
  /* select function: Add or update an item into collection                       */
  /* It's called when a select component is used                                  */
  /*------------------------------------------------------------------------------*/
  /* @params $event: item for add or update and save response, collection         */
  /* @return item selected id                                                     */
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
      //this.loading = MessFactory.loading("Processing...");
      if (this.options.request.path){        
        doAction(this.item);
      }
      else finish(this.item);
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

function FieldFormCtrl(DataFactory, FormFactory, MessFactory, appConfig) {
  this.operation = { edit: false, selected: {} };
  this.permission = { require: false };

  /*------------------------------------------------------------------------------*/
  /* GestSection Function: Get the section's fields                               */
  /* @params: section JSON file that contains the fields collection               */
  /*------------------------------------------------------------------------------*/
  let getSection = section => {
    let sectionName = `${appConfig.pathForms}/Sections/${section.source}`;
    DataFactory.getJson(sectionName).then(
      response => { section.fields = response.data; },
      error =>{
        this.loading = MessFactory.add({ type: "danger", description: "Error when getting the section data"});
      }
    );
  };

  /*------------------------------------------------------------------------------*/
  /* $onInit function. It executes when the component was initialized             */
  /*------------------------------------------------------------------------------*/
  /* Check if the field has a nested form, options, collection, object or sections*/
  /*------------------------------------------------------------------------------*/
  this.$onInit = () => {
    this.template = `public/angular/templates/forms/${this.fieldType}.html`;
    /*----------------------------------------------------------------*/
    /* Get the nested form and its params                             */
    /*----------------------------------------------------------------*/
    if (this.field.nestedForm) this.nestedForm = this.field.nestedForm;
    /*----------------------------------------------------------------*/
    /* Get the field's options, collection or object                  */
    /*----------------------------------------------------------------*/
    if (this.field.options) this.options = this.field.options;

    if (this.field.collection) this.collection = this.field.collection;

    if (this.field.object) this.object = this.field.object;

    /*----------------------------------------------------------------*/
    /* Get the field's sections                                       */
    /*----------------------------------------------------------------*/
    if (this.field.sections)
      this.field.sections.map(section => {
        if (section.source) getSection(section);
      });
  };

  this.setParams = (params, module = "") => {
    if (params) {
      params = DataFactory.setFormParams(params, this.item);
      return DataFactory.setFormParams(params, this.parent.options.params);
    }
  };

  this.getStringParams = (params, item) => {
    return Array.isArray(params) ? DataFactory.getStringParams(params, item) : params;
  };

  /*------------------------------------------------------------------------------*/
  /* changeState function. Change the boolean value                               */
  /*------------------------------------------------------------------------------*/
  /* @params: field field name; callback function (optional)                      */
  /*------------------------------------------------------------------------------*/
  /* Exec a callback function if it exists                                        */
  /*------------------------------------------------------------------------------*/
  this.changeState = (field, callback = null) => {
    this.item[field] =
      this.item[field] == true || this.item[field] == 1 ? false : true;
    if (callback) 
      this.item = this.execFunction(callback);
  };

  /*------------------------------------------------------------------------------*/
  /* execFunction function. Exec a dynamic function                               */
  /*------------------------------------------------------------------------------*/
  /* @params: function                                                            */
  /*------------------------------------------------------------------------------*/
  /* return the function for executing                                            */
  /*------------------------------------------------------------------------------*/
  this.execFunction = func => {
    let paramItem = this.item ? this.item : this.parent.options.params;
    if (func) 
      return DataFactory.getFunction(func)(paramItem, FormFactory);
  };

  /*------------------------------------------------------------------------------*/
  /* toggle function. Add or remove an item into collection                       */
  /*------------------------------------------------------------------------------*/
  /* @params: collection, item                                                    */
  /*------------------------------------------------------------------------------*/
  this.toggle = (collection, item) => {
    return DataFactory.toggle(collection, item);
  };

  /*------------------------------------------------------------------------------*/
  /* merge function. Merge two json objects It's called when select field is used */
  /*------------------------------------------------------------------------------*/
  /* @params: selected, a record value                                            */
  /*------------------------------------------------------------------------------*/
  this.merge = selected => {
    this.item = FormFactory.mergeJson(this.item, selected);
    if (this.item && this.field.onChange) {
      let source = this.field.onChange.from;
      let value_source = this.operation.selected[source];
      this.updateItem(this.field.onChange.destination, value_source);
    }
    return selected;
  };

  /*------------------------------------------------------------------------------*/
  /* set selection function. Set item from selection                              */
  /*------------------------------------------------------------------------------*/
  /* @params: selection from search/add/edit                                      */
  /*------------------------------------------------------------------------------*/
  this.setSelection = selection => {
    if (!selection) return selection;
    this.object.fields.map(el => {
      if (!selection[el.name] && el.name != "id") {
        selection[el.name] = this.recursiveSelection(selection, el);
      }
    });
    return selection;
  };

  /*------------------------------------------------------------------------------*/
  /* set collection function. Set item from collection                            */
  /*------------------------------------------------------------------------------*/
  /* Uses this function for select control                                        */
  /*------------------------------------------------------------------------------*/
  this.setCollection = () => {
    if (this.field.reference)
      this.collection = this.parent.options.params[this.field.reference].value;
    else {
      let router = `${this.field.router}.php`;
      DataFactory.records( router, this.field.action || "getAll", this.getStringParams(this.field.params, this.item)
      ).then(
        list => {
          if (list.error) {
            MessFactory.add({ type: "danger", description: `Error when getting the data ${this.list.code}.${this.list.message}`});
          } else this.collection = list;
        },
        error => {
          MessFactory.add({ type: "danger", description: "Error al intentar recuperar los datos"});
        }
      );
    }
  };

  this.recursiveSelection = (selection, el) => {
    for (let key in selection) {
      if (el.name == key) return selection[key];
      else {
        if (selection[key] && typeof selection[key] === "object")
          return this.recursiveSelection(selection[key], el);
      }
    }
  };

  /*------------------------------------------------------------------------------*/
  /* showIf function. Check if a criteria's collection is true                    */
  /*------------------------------------------------------------------------------*/
  /* @params: fields collection                                                   */
  /*------------------------------------------------------------------------------*/
  this.showIf = fields => {
    return fields ? FormFactory.showIf(fields, this.item) : true;
  };

  this.trigger = (value = null) => {    
    if(this.field.onChange) {
      if(value)
        this.updateItem(this.field.onChange.destination, value);
      if(this.field.onChange.trigger){
        let element = angular.element("#" + this.field.onChange.trigger);        
        if(element[0].attributes["item-ref"] && element[0].attributes["item-ref"].nodeValue){          
          this.updateItem(this.field.onChange.destination, element[0].attributes["item-ref"].nodeValue)
        }else
          this.updateItem(this.field.onChange.destination, 0)
      }
    }
  };

  this.updateItem = (destination, value_source) => {
    for (let key in destination) {
      if (this.parent.form[key]) {
        let val = this.parent.form[key].$viewValue,
          update = destination[key].update,
          val_update;

        if (val && this.parent.form[update]) {
          if (destination[key].operation == "sum")
            val_update = "+" + (parseFloat(val) + parseFloat(value_source));
          
          if(destination[key].operation == "prod")
            val_update = parseFloat(val) * parseFloat(value_source);                    
        }
        this.parent.form[update].$setViewValue(val_update);          
        this.parent.form[update].$render();        
      }
    }
  };
}

angular
  .module("app")
  .component("formComp", {
    templateUrl: "public/angular/templates/form.html",
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
    template:
      '<div ng-if="$ctrl.template" style="width: 100%;" ng-include="$ctrl.template"></div>',
    controller: FieldFormCtrl,
    bindings: {
      fieldType: "@",
      name: "@",
      customTemplate: "@?",
      field: "<",
      item: "="
    },
    require: {
      parent: "^^formComp"
    }
  })
  .component("authComp",{
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
  });