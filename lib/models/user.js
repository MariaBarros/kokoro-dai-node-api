/*------------------------------------------------------**
** Dependencies - Helpers                               **
**------------------------------------------------------*/
const helpers = require('../helpers/index');


/*------------------------------------------------------**
** Class User                                           **
**------------------------------------------------------*/
class User{
  constructor(firstName, lastName, username, password, phone, role){
    this.firstName = helpers.isNotEmptyString(firstName) ? firstName.trim() : false;
    this.lastName = helpers.isNotEmptyString(lastName) ? lastName.trim() : false;
    this.username = helpers.isNotEmptyString(username) ? username.trim() : false;
    this.password = helpers.isNotEmptyString(password) ? password.trim() : false;    
    this.role = helpers.isNotEmptyString(role) ? role.trim() : false;
    if(helpers.isNotEmptyString(phone))
      this.phone = phone.trim();
  }

  setId(){
    return helpers.hash(this.username + this.password);
  }

  setPassword(){
    if(this.password.length < 20) 
      this.password = helpers.hash(this.password);
  }

  hasRequiredProperties(){
    return this.firstName && this.lastName && this.username && this.password && this.role;
  }

  static getAvailableMethods(){
    return ['post','get','put','delete']
  }

  static getAvailableActions(){
    return ['getAll','getOne','update','delete'];
  }

  static getDataSource(){
    return 'users';
  }

}

// Export the User Model
module.exports = User;