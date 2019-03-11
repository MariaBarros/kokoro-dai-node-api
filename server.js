/*------------------------------------------------------**
** Server-related tasks                                 **
**------------------------------------------------------*/

// Dependencies
const http = require('http');
const https = require('https');
const StringDecoder = require('string_decoder').StringDecoder;

const url = require('url');
const path = require('path');
const fs = require('fs');
const config = require('./lib/config/index');
const router = require('./router');

/*------------------------------------------------------**
** Request handler on the server                        **
**------------------------------------------------------*/

const server = {};

// Instantiate the HTTP server
server.httpServer = http.createServer(function(req,res){
   server.unifiedServer(req,res);
 });

 // Instantiate the HTTPS server
server.httpsServerOptions = {
   'key': fs.readFileSync(path.join(__dirname,'./https/key.pem')),
   'cert': fs.readFileSync(path.join(__dirname,'./https/cert.pem'))
 };

 server.httpsServer = https.createServer(server.httpsServerOptions,function(req,res){
   server.unifiedServer(req,res);
 });

server.unifiedServer = function(req, res) {
  // Parse the url
  const parsedUrl = url.parse(req.url, true);

  // Get the path
  const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');  

  // Get the method and headers
  const method = req.method.toLowerCase(),
    headers = req.headers;

  // Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';

  req.on('data', function(data) {
    buffer += decoder.write(data);
  });

  req.on('end', function() {
    buffer += decoder.end();

    const data = {
      req: req,
      path: path,
      queryStringObject: parsedUrl.query,   // get the query string as an object
      method: method,
      headers: headers,
      payload: buffer,
    };

    // Route the request.
    router.route(path, data, res);
  });
};

server.init = function(){
  // Start the HTTP server
  server.httpServer.listen(config.httpPort,function(){
    console.log('\x1b[36m%s\x1b[0m','The HTTP server is running on port '+config.httpPort);
  });

  // Start the HTTPS server
  server.httpsServer.listen(config.httpsPort,function(){
    console.log('\x1b[35m%s\x1b[0m','The HTTPS server is running on port '+config.httpsPort);
  });
}

module.exports = server;