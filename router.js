/*------------------------------------------------------**
** Dependencies - Handlers                              **
**------------------------------------------------------*/
const _user = require('./lib/handlers/user');
const _token = require('./lib/handlers/token');
const _check = require('./lib/handlers/check');
const _web = require('./lib/handlers/web');

const errorHandlers = {
  notFound: function(data, response) {
    response(404,{message: "Route not found"});
  }
};

const routerPaths = {
  '': _web.index,
  'account/create': _web.accountCreate,
  'account/created': _web.accountCreated,
  'account/edit': _web.accountEdit,
  'account/deleted': _web.accountDeleted,
  'session/create': _web.sessionCreate,
  'session/deleted': _web.sessionDeleted,
  'checks/all': _web.checksList,
  'checks/create': _web.checksCreate,
  'checks/edit': _web.checksEdit,
  'api/users': _user.handlers,
  'api/tokens': _token.handlers,
  'api/checks': _check.handlers,  
  'favicon.ico' : _web.favicon,
  'public' : _web.public
};

const router = {};

/*------------------------------------------------------**
** Route the current request to the handler             **
**------------------------------------------------------**
* @param {String} path: the trimmed path                **
* @param {Object} data: Info about the request Object   **
* @param {Object} res: The server response object       **
**------------------------------------------------------*/

router.route = function(path, data, res) {
  // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
  let chosenHandler = typeof(routerPaths[path]) !== 'undefined' ? routerPaths[path] : errorHandlers.notFound;
  
  // If the request is within the public directory use to the public handler instead
  chosenHandler = path.indexOf('public/') > -1 ? _web.public : chosenHandler;

  // Route the request to the handler specified in the router
  chosenHandler(data,function(statusCode, payload, contentType){

    // Determine the tpe of response (fallback to json)
    contentType = typeof(contentType) == 'string' ? contentType : 'json';

    // Use the status code returned from the handler, or set the default status code to 200
    statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

    // Return the response-parts that are content-specific
    let payloadString = '';

    if(contentType == 'json'){
      res.setHeader('Content-Type', 'application/json');
      // Use the payload returned from the handler, or set the default payload to an empty object
      payload = typeof(payload) == 'object'? payload : {};        
      payloadString = JSON.stringify(payload);
    }else{
      if(contentType == 'html'){
        res.setHeader('Content-Type', 'text/html');
        payloadString = typeof(payload) == 'string'? payload : '';
      }

      if(contentType == 'favicon'){
        res.setHeader('Content-Type', 'image/x-icon');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
      }

      if(contentType == 'plain'){
        res.setHeader('Content-Type', 'text/plain');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
      }

      if(contentType == 'css'){
        res.setHeader('Content-Type', 'text/css');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
      }

      if(contentType == 'png'){
        res.setHeader('Content-Type', 'image/png');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
      }

      if(contentType == 'jpg'){
        res.setHeader('Content-Type', 'image/jpeg');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
      }
    }

    // Return the response        
    res.writeHead(statusCode);
    res.end(payloadString);        
  });
};

module.exports = router;