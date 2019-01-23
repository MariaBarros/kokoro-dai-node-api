/*------------------------------------------------------**
** Dependencies - Helpers                               **
**------------------------------------------------------*/
const stringHelper = require('../helpers/index');


/*------------------------------------------------------**
** Class User                                           **
**------------------------------------------------------*/
class User{
  constructor(firstName, lastName, username, password, role){
    this.firstName = stringHelper.isNotEmptyString(firstName) ? firstName.trim() : false;
    this.lastName = stringHelper.isNotEmptyString(lastName) ? lastName.trim() : false;
    this.username = stringHelper.isNotEmptyString(username) ? username.trim() : false;
    this.password = stringHelper.isNotEmptyString(password) ? password.trim() : false;
    this.role = stringHelper.isNotEmptyString(role) ? role.trim() : false;
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