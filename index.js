/*------------------------------------------------------**
** Primary file for API                 				**
**------------------------------------------------------*/

// Dependencies
const server = require('./server');  
const workers = require('./workers');

const app = {};

// Init function
app.init = function(){

  // Start the server
  server.init();

  // Start the workers
  //workers.init();

};

// Self executing
app.init();


// Export the app
module.exports = app;
