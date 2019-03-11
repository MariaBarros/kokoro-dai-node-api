/*------------------------------------------------------**
** Create and export configuration variables            **
**------------------------------------------------------*/

// Container for all environments
var pages = {};

// Staging (default) environment
pages.index = {  
  'head.title' : 'Uptime Monitoring - Made Simple',
  'head.description' : 'We offer free, simple uptime monitoring for HTTP/HTTPS sites all kinds. When your site goes down, we\'ll send you a text to let you know',
  'body.class' : 'index'
};


pages.accountCreate = {
  'head.title' : 'Create an Account',
  'head.description' : 'Signup is easy and only takes a few seconds.',
  'body.class' : 'accountCreate'
};

pages.accountCreated = {
  'head.title' : 'Account Created',
  'head.description' : 'Your account has been created.',
  'body.class' : 'accountCreate'
};

pages.sessionCreate = {
  'head.title' : 'Login to your account.',
  'head.description' : 'Please enter your phone number and password to access your account.',
  'body.class' : 'sessionCreate'
};

pages.accountEdit = {
  'head.title' : 'Account Settings',
  'body.class' : 'accountEdit'
};

pages.sessionDeleted = {
  'head.title' : 'Logged Out',
  'head.description' : 'You have been logged out of your account.',
  'body.class' : 'sessionDeleted'
};

pages.accountDeleted = {
  'head.title' : 'Account Deleted',
  'head.description' : 'Your account has been deleted.',
  'body.class' : 'accountDeleted'
};

pages.checksCreate = {
  'head.title' : 'Create a New Check',
  'body.class' : 'checksCreate'
};

pages.checksList = {
  'head.title' : 'Dashboard',
  'body.class' : 'checksList'
};

pages.checksEdit = {
  'head.title' : 'Check Details',
  'body.class' : 'checksEdit'
};

// Export the module
module.exports = pages;