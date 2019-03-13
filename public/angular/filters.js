function elipsis() {
  return function (text, length) {
    if (text && text.length > length) {
      return text.substr(0, length)+'...';
   }
   return text;
  }
}

function filterBoolean() {
  return function (value, valueTrue = "Si", valueFalse = "No" ) {               
    return (value === "1" || value === true) ? valueTrue: valueFalse;        
  }
}

function types() {
  return function (value, options ) {               
    if("undefined" == typeof value) return '';
    let type = options.filter( (el) => { return el.code == value})        
    return (Array.isArray(type)) ? type[0].value : ''
  }
}

/*------------------------------------------------------*/
/* Date & Time                                          */
/*------------------------------------------------------*/  
function filterHour(){
  return function(value){    
    if(value){
      var formatHour = value      
      if(value.length<=2) formatHour = "00"+value;    
      if(value.length==3) formatHour = "0"+value;    
      formatHour =  formatHour.replace(/(\d\d)(\d\d)/, "\$1:$2");
      return formatHour
    }
  }
}

function hms(){
  return  function(seconds, format) {
    format = format || ['h ', 'm ', 's'];
    
    var divisor = {};
    divisor.m = seconds % (60 * 60);
    divisor.s = divisor.m % 60;

    var h = Math.floor(seconds / (60 * 60)),
    m = Math.floor(divisor.m / 60),
    s = Math.ceil(divisor.s);

    var hms = '';

    if (h > 0) {
      hms = hms.concat(h + (format[0] ? format[0] : ''));
    }

    if (m > 0) {
      hms = hms.concat(m + (format[1] ? format[1] : ''));
    }

    hms = hms.concat(s + (format[2] ? format[2] : ''));
    return hms;
  }
}

function asDate(DatesFactory) {
  return function (input, format){
    if(input){
      var d =  new Date(input); 
      d = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
      var DayName = DatesFactory.getDayName(d.getDay()), 
        MonthName = DatesFactory.getMonthName(d.getMonth())        

      return DayName + " " + d.getDate() + " de " + MonthName + " de " + d.getFullYear()
    }
  }
}

function formatDate($filter,DataFactory){
  return function(date){
    var lang = DataFactory.getLang(), 
    format = (lang=='es') ? "dd/MM/yyyy" : "MM/dd/yyyy"

    return $filter('date')(date, format)
  }
}

function convertDate() {
    return function (input) {      
      if(input) return new Date(input);  
      else{
        return new Date()
      }      
    }
}

function diffDate(){
  return function(input){
    var _MS_PER_DAY = 1000 * 60 * 60 * 24 * 365, today = new Date(), from
    if(input !== null){
      try{
        if(input.length <= 8)
          from = new Date(input.substr(4,4), input.substr(2,2), input.substr(0,2))
        else
          from = new Date( input.substr(0,4), input.substr(5,2), input.substr(8,2))
        
        from = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
        today = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

        return Math.floor((today - from) / _MS_PER_DAY);
      }catch(err){
        return 0
      }
    }
  }
}


/*------------------------------------------------------*/
/* Parameters                                           */
/*------------------------------------------------------*/
function params() {
  return function (routeParams) {
    var _params = "", list = Object.keys(routeParams);
    if(!Array.isArray(list)) return ""    

    list.map(function(el){
      if(el != "action") _params += "&" + el + "=" + routeParams[el];      
    })
    return _params
  }
}

function paramFormat() {
  return function (data) {
    var obj = Object.keys(data);    
    obj.map(function(el){
      var match = /\d+/.exec(el);
      if(match)  delete data[match[0]];       
    })
    return data
    }
}


/*------------------------------------------------------*/
/* Multilingual                                         */
/*------------------------------------------------------*/
function contentLang() {
  var lang = localStorage.getItem('lang')  
  return function (item, fields) {
    if(lang=='') return item
    else {
      fields.map((el)=>item[el] = item[el+'_'+lang])
    }
  }
}

/*------------------------------------------------------*/
/* Others                                               */
/*------------------------------------------------------*/
function parse() {  
  return function (item, fields) {       
    fields.map(function (el) {     
      if(el.type=='int') item[el.name] = parseInt(item[el.name])      
    })
    return item
  }
}

function destroyEl(MessFactory, $timeout) {
  return function (text, message, id) {
    if(message.type == "success"){
      $timeout(function(){  
        MessFactory.delete(message);
      },4000);
      $timeout(function(){
        let el = document.querySelector(`#mess_${id}`);
        if(el)
          el.classList.add("fadeOut");        
      },3500);
    }
    return text;
  }
}

angular.module('app')
    .filter('sbool', filterBoolean) 
  .filter('types', types)  
  .filter('filterHour', filterHour)  
  .filter('hms', hms)  
    .filter('ellipsis', elipsis)    
  .filter('destroy', destroyEl)
  .filter("params", params)
  .filter("parse", parse)    
  .filter("contentLang", contentLang)
  .filter("paramFormat",paramFormat)
  .filter("asDate", asDate)
  .filter("diffDate", diffDate)
  .filter("convertDate",convertDate)
  .filter("formatDate", formatDate);