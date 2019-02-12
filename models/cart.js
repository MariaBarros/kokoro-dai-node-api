/*------------------------------------------------------**
** Dependencies - Helpers                               **
**------------------------------------------------------*/
const helpers = require('../helpers/index');
const _article = require('../models/article');


/*------------------------------------------------------**
** Class Cart                                           **
**------------------------------------------------------*/
class Cart{
  constructor(clientId, secret, item = null){
    this.clientId = helpers.isNotEmptyString(clientId) ? clientId.trim() : false;
    this.secret = helpers.isNotEmptyString(secret) ? secret.trim() : "";
    this.token = helpers.hash(this.clientId + this.secret);
    if(item != null){
      this.setItem(item);
    }    
  }

  setId(){
    return helpers.hash(this.clientId + this.secret);
  }

  hasRequiredProperties(){
    return this.clientId && this.secret && this.items;
  }

  setItem(item){
    if(!this.items)
    {
        this.items = [];
    }

    this.items.push(new _article(item.id, item.description, item.quantity, item.price));
    this.setTotal();
  }

  removeItem(item){
    let index = this.items.findIndex(function(element){
      return element.id == item.id;});
      
    if(index > -1){
      this.items.splice(index, 1); // remove one item from the index
    }
    this.setTotal();
  }

  setTotal(){
    let total = 0;
    this.items.forEach(function(item){    
        //total += (item.hasOwnProperty("price")) ? (item.price * (1 - item.getDiscount())) : 0;
        total += (item.hasOwnProperty("price")) ? parseFloat(item.price * item.quantity) : 0;
    });
    this.total = total;
  }

  static getAvailableMethods(){
    return ['post','get','put','delete']
  }

  static getAvailableActions(){
    return ['getAll','getOne','update','delete'];
  }

  static getDataSource(){
    return 'carts';
  }
}

// Export the Cart Model
module.exports = Cart;
