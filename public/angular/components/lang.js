function LanguageCtrl(appConfig, $route){
  this.$onInit = () =>{    
    let lang = appConfig.lan

    if(!lang ) {
      this.selected = appConfig.languages[0]
      appConfig.setLan(this.selected.code)      
    }else 
    this.selected = appConfig.languages.filter(el=>el.code==lang)[0];    
    this.dirSaticsTemplates = "templates/statics/" + this.selected.code + "/";
  }

  this.changeLang = (lang) =>{
    this.selected = lang
    appConfig.setLan(this.selected.code)    
    $route.reload()
  }
};

function ContentLanCtrl(LabelsFactory, appConfig){
  var lang = appConfig.lan
  this.$onInit = ()=>{    
    if(this.index){
      LabelsFactory.getLabels().then( (response) =>{       
        this.item = LabelsFactory.getContentTemplate(this.index, this.collection)          
        this.item.label = (this.item[lang] && this.item[lang]!="") ?  this.item[lang] : this.item['es']
      })
    }
  }  

  this.$onChanges = (obj) =>{     
    if(obj.item && obj.item.currentValue) {      
      this.item = obj.item.currentValue      
      this.item.label = (this.item[lang] && this.item[lang]!="") ?  this.item[lang] : this.item['es']      
    }    
  }
};

angular.module('app')
.component('langComp', {
  templateUrl: 'public/angular/templates/header-language.html',
  controller: LanguageCtrl  
})

.component('contentLan', {
  template: '<span>{{$ctrl.item.label}}</span><div ng-if="$ctrl.trunc" ng-bind-html="$ctrl.item.label | ellipsis:$ctrl.trunc"></div>',
  controller: ContentLanCtrl,  
  bindings:{
    item:"<",    
    index:"@",
    collection:"@",
    trunc:"@"
  }  
});