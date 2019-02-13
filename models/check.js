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
    return Check.isValidUserId(data.userId) 
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

  static isValidUserId(userId){
    return helpers.isNotEmptyString(userId) && userId.trim().length > 0;
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

// Export the User Model
module.exports = Check;