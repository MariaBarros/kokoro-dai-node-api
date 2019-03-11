/*------------------------------------------------------**
** Dependencies - Helpers                               **
**------------------------------------------------------*/
const helpers = require('../helpers/index');


/*------------------------------------------------------**
** Class Check                                           **
**------------------------------------------------------*/
class Check{

  constructor(){
    
  }

  static hasRequiredProperties(data){
    return helpers.isNotEmptyString(data.username)
          && Check.isValidProtocol(data.protocol)
          && helpers.isNotEmptyString(data.url) 
          && Check.isValidMethod(data.method)
          && helpers.isObject(data.successCodes) && data.successCodes instanceof Array && data.successCodes.length>0
          && helpers.isInt(data.timeoutSeconds)  && parseInt(data.timeoutSeconds) >= 1 && parseInt(data.timeoutSeconds) <= 5;
          //&& typeof(data.lastChecked) == 'number' && data.lastChecked > 0;
  }

  setId(){
    return helpers.createRandomString(this.username + this.password);
  }

  static perform(check){
    if(check){
      check.id = check.id.trim();
      if(check.userPhone)
        check.userPhone = check.userPhone.trim();
      
      check.url = check.url.trim();
    
      check.state = helpers.isNotEmptyString(check.state) && helpers.contain(['up','down'] , check.state) 
          ? check.state : 'down';
    }
    return check;
  }

  static isValidProtocol(protocol){
    return helpers.isNotEmptyString(protocol) && helpers.contain(['http','https'], protocol);
  }

  static isValidMethod(method){
    return helpers.isNotEmptyString(method) && helpers.contain(['post','get','put','delete'], method);
  }

  static getAvailableMethods(){
    return ['post','get','put','delete']
  }

  static getDataSource(){
    return 'checks';
  }

}

// Export the Check Model
module.exports = Check;