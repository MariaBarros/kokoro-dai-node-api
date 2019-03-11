/*------------------------------------------------------**
** Dependencies - Helpers                               **
**------------------------------------------------------*/
const helpers = require('../helpers/index');


/*------------------------------------------------------**
** Class Token                                           **
**------------------------------------------------------*/
class Token{
  constructor(username, password){    
    this.username = helpers.isNotEmptyString(username) ? username.trim() : false;    
    this.password = helpers.isNotEmptyString(password) ? password.trim() : false; 
    if(this.password.length<24)
      this.password = helpers.hash(this.password);
  }

  hasRequiredProperties(){
    return this.username && this.password;
  }

  setToken(){
    // Create a new token with a random name
    this.tokenId = helpers.createRandomString(20);
    // Set an expiration date 1 hour in the future.
    this.expires = Date.now() + 1000 * 60 * 60;
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