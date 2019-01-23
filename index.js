/*------------------------------------------------------**
** Primary file for API                 				**
**------------------------------------------------------*/

// Dependencies
var http = require('http'),  
  config = require('./config/'),
  server = require('./server');  

 // Instantiate the HTTP server
var httpServer = http.createServer(function(req,res){
  server.requestHandler(req,res);  
});

// Start the HTTP server
httpServer.listen(config.httpPort,function(){
  console.log('The HTTP server is running on port '+config.httpPort);
});