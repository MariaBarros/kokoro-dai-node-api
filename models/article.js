/*------------------------------------------------------**
** Dependencies - Helpers                               **
**------------------------------------------------------*/
const helpers = require('../helpers/index');


/*------------------------------------------------------**
** Class Cart                                           **
**------------------------------------------------------*/
class Article{
  constructor(properties){
    let {id, description, price, ...} = properties;

    properties.forEach(function (property){
      this[property[0]] = property[1];
    });
  }

  static getAvailableMethods(){
    return ['post','get','put','delete']
  }

  getDiscount(){
    if(this.hasProperty("discount")){
      return this.discount;
    }
    return 0;
  }
}

// Export the User Model
module.exports = User;
