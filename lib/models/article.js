/*------------------------------------------------------**
** Dependencies - Helpers                               **
**------------------------------------------------------*/
const helpers = require('../helpers/index');


/*------------------------------------------------------**
** Class Cart                                           **
**------------------------------------------------------*/
class Article{
  constructor(id, description, quantity, price){
    this.id = id;
    this.description = description;
    this.quantity = quantity;
    this.price = price;
  }

  static getAvailableMethods(){
    return ['post','get','put','delete']
  }

  getDiscount(){
    if(this.hasOwnProperty("discount")){
      return this.discount;
    }
    return 0;
  }
}

// Export the User Model
module.exports = Article;
