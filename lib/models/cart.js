/*------------------------------------------------------**
** Dependencies - Helpers                               **
**------------------------------------------------------*/
const helpers = require('../helpers/index');
const _article = require('../models/article');


/*------------------------------------------------------**
** Class Cart                                           **
**------------------------------------------------------*/
class Cart{
  constructor(clientId, secret, item){
    this.clientId = helpers.isNotEmptyString(clientId) ? clientId.trim() : false;
    this.secret = helpers.isNotEmptyString(secret) ? secret.trim() : "";
    this.items = [item];
    this.expires = Date.now() + 1000 * 60 * 60;
  }

  setId(){
    return helpers.hash(this.clientId + this.secret);
  }

  hasRequiredProperties(){
    return this.clientId && this.secret && this.items;
  }

  static setTotal(items){
    let total = 0;
    items.forEach(function(item){    
        //total += (item.hasOwnProperty("price")) ? (item.price * (1 - item.getDiscount())) : 0;
        total += (item.hasOwnProperty("price")) ? parseFloat(item.price * item.quantity) : 0;
    });
    return total;
  }

  static getAvailableMethods(){
    return ['post','get','put','delete']
  }

  static getAvailableActions(){
    return ['add','update','remove'];
  }

  static getDataSource(){
    return 'carts';
  }

  static update(item, items){
    let index = -1;
    switch(item.action){
        case "add":
          delete item.action;
          items.push(item);          
          break;
        case "remove":
          let delItem = items.filter(el => el.id == item.id);
          index = items.indexOf(delItem[0]);

          if(index >= 0){
            items.splice(index, 1);
          }
          break;
        case "update":
          let delItem = items.filter(el => el.id == item.id);
          index = items.indexOf(delItem[0]);
          
          if(index >= 0){
            items[index] = item;
          }
          break;
      }

      return items;
  }
}

// Export the Cart Model
module.exports = Cart;
