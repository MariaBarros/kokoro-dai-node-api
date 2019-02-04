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
    return Check.isValidId(data.id) 
          && Check.isValidPhone(data.userPhone) 
          && Check.isValidProtocol(data.protocol)
          && helpers.isNotEmptyString(data.url) 
          && Check.isValidMethod(data.method)
          && helpers.isObject(data.successCodes) && helpers.isNotEmptyArray(data.successCodes)
          && helpers.isInt(data.timeoutSeconds)  && data.timeoutSeconds >= 1 && data.timeoutSeconds <= 5 
          && typeof(data.lastChecked) == 'number' && data.lastChecked > 0;

  // If all checks pass, pass the data along to the next step in the process
   return id && userPhone && protocol && url && method && successCodes && timeoutSeconds;
  }  

  static isValidId(id){
    return helpers.isNotEmptyString(id) && id.trim().length == 20;
  }

  static isValidPhone(phone){
    return helpers.isNotEmptyString(phone) && phone.trim().length == 10 ? phone.trim() : false;
  }

  static isValidProtocol(protocol){
    return helpers.isNotEmptyString(protocol) && helpers.contain(['http','https'], protocol);
  }

  static isValidMethod(method){
    return helpers.isNotEmptyString(method) && helpers.contain(['post','get','put','delete'], method);
  }

  static getDataSource(){
    return 'checks';
  }

}

// Export the User Model
module.exports = Check;