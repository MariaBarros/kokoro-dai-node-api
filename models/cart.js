/*------------------------------------------------------**
** Dependencies - Helpers                               **
**------------------------------------------------------*/
const helpers = require('../helpers/index');
const articles = require('../models/article');


/*------------------------------------------------------**
** Class Cart                                           **
**------------------------------------------------------*/
class Cart{
  constructor(clientId, secret, item){
    this.clientId = helpers.isNotEmptyString(clientId) ? clientId.trim() : false;
    this.secret = helpers.isNotEmptyString(secret) ? secret.trim() : "";
    this.token = helpers.hash(this.clientId + this.secret);
    this.setItem(item);
    this.total=0;

  }

  setItem(item){
     if(!this.items)
     {
        this.items = [];
    }

//    if(item instanceof Article){
      this.items.push(item);
      this.setTotal();
//    }
  }

  setTotal(){
    this.total = 0;
    //this.items.forEach(function(item){
    //this.total += (item.hasProperty("price")) ? (item.price * (1 - item.getDiscount())) : 0;
    this.total +=100;
    //});
  }

  removeItem(item){
    let index = this.items.indexOf(item);
    if(index > -1){
      this.items = this.items.slice(index);
    }
    this.setTotal();
  }

  static getAvailableMethods(){
    return ['post','get','put','delete']
  }

  static getAvailableActions(){
    return ['getAll','getOne','update','delete'];
  }
}

// Export the User Model
module.exports = Cart;
