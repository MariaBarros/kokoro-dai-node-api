/*------------------------------------------------------**
** Dependencies - Handlers                              **
**------------------------------------------------------*/
const _userHandlers = require('./routers/user');
const _tokenHandlers = require('./routers/token');

const errorHandlers = {
  notFound: function(data, response) {
    response(404,{message: "Route not found"});
  }
};

const routerPaths = {
  'users': _userHandlers.users,
  'tokens': _tokenHandlers.tokens  
};

const router = {};

/*------------------------------------------------------**
** Route the current request to the handler             **
**------------------------------------------------------**
* @param {String} path: the trimmed path                **
* @param {Object} data: Info about the request Object   **
* @param {Object} res: The response object              **
**------------------------------------------------------*/

router.route = function(path, data, res) {
  // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
  var chosenHandler = typeof(routerPaths[path]) !== 'undefined' ? routerPaths[path] : errorHandlers.notFound;

  // Route the request to the handler specified in the router
      chosenHandler(data,function(statusCode, payload){

        // Use the status code returned from the handler, or set the default status code to 200
        statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

        // Use the payload returned from the handler, or set the default payload to an empty object
        payload = typeof(payload) == 'object'? payload : {};

        // Convert the payload to a string
        var payloadString = JSON.stringify(payload);

        // Return the response
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(statusCode);
        res.end(payloadString);        
      });
}

module.exports = router;