// Dependencies
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const router = require('./router');

/*------------------------------------------------------**
** Request handler on the server                        **
**------------------------------------------------------*/

const server = {};

server.requestHandler = function(req, res) {
  // Parse the url
  const parsedUrl = url.parse(req.url, true);

  // Get the path
  const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');

  // get the query string as an object
  const queryStringObject = parsedUrl.query;

  // Get the method
  var method = req.method.toLowerCase();

  //Get the headers as an object
  var headers = req.headers;

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
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      payload: buffer,
    };

    // Route the request.
    router.route(path, data, res);
  });
};

module.exports = server;