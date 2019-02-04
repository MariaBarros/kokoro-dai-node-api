/*------------------------------------------------------**
** Dependencies - Helpers                               **
**------------------------------------------------------*/
const helpers = require('../helpers/index');


/*------------------------------------------------------**
** Class Token                                           **
**------------------------------------------------------*/
class Token{
  constructor(userId, password){    
    this.userId = helpers.isNotEmptyString(userId) ? userId.trim() : false;    
    this.password = helpers.isNotEmptyString(password) ? password.trim() : false;        
  }

  hasRequiredProperties(){
    return this.userId && this.password;
  }

  setToken(){
    // Create a new token with a random name
    this.tokenId = helpers.createRandomString(20);
    // Set an expiration date 1 hour in the future.
    this.expires = Date.now() + 1000 * 60 * 60;
  }  

  static isValidToken(expires){
    return helpers.graterThanToday(expires);
  }

  static updateTokenExpires(){
    return Date.now() + 1000 * 60 * 60;
  }

  static getAvailableMethods(){
    return ['post','get','put','delete']
  }

  static getAvailableActions(){
    return ['getAll','getOne','update','delete'];
  }

  static getDataSource(){
    return 'tokens';
  }

}

// Export the Token Model
module.exports = Token;