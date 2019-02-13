# NodeJS - API
![NodeJS-HTTP](https://img.shields.io/badge/node-http-green.svg)

## Description

This is and example of how to structure a project for building an API.

## Starting the Server
For starting the server, we are going to need the node `http` module that it will listen to a specific port defined in the config file, and respond with a data.

## Parsing Request Paths
Here, we are going to start figuring out which sources people are requesting when they send a request to the API. 
In order to do that, we need to parse the URL that they are asking for. Node has a library for all things related to URL functions called URL. 

For each request to the server, we need to get the URL and parse it. Once we parse the URL, we obtain the path, and the server sends the response.

The request object contains the whole bunch of information about what the users are asking for.

## Parsing HTTP Methods
Based on the requirements of this API, want to allow the request methods: get, post, put and delete. 
When a request comes in, we want to figure out which HTTP method the user is requesting. The method is one of the objects available on the request. Remember that this request is new for every single incoming request.

The way for obtaining the method of the request is `req.method`.

## Parsing Query Strings
A query string is an object of the parsed URL, and we can get it like this: `consts queryStringObject = parsedUrl.query`.
What that means for our case, is when someone sends the URL with a bunch of query parameters on the end. For example `http://www.myapi.com?search=parse`. Those all parameters are going to be parsed through `url.parse(req.url, true)` , and put nicely inside of `queryStringObject` with keys and values. 
For the above example, the queryStringObject is `{search: parse}`.

## Parsing Request Headers
The next thing we are going to do before processing the request is to get the headers that the user might send. Headers is also one of the objects available on the request as the method object as well.

## Parsing Payloads
The next that we want to do is getting the payload that the user sends. We're going to need another node library called `string_decoder`, and we'll use its StringDecoder function. 
The payload that comes is part of the HTTP request coming to the HTTP server as a string, and so we need to collect that string as a comes in. What this means is a large string that streaming in is going to be received by us in little pieces at a time. That's why we catch the data event.

```
let decoder = new StringDecoder('utf-8');
let buffer = '';
req.on('data', function(data){
	buffer += data;
});

```
But we need to know when the data envent is done. The 'end' event says us when this happens:
```
req.on('end', function(){
	buffer += decoder.end();
});

```
When the event is done, the buffer will be appended with `decoder.end();`. Then,the complete payload is in the buffer variable. So, we can send the response into the handler of the end event.

This is how NodeJS generally handles strings. You don't simply grab the value of the string, you need to bind to the data event of the string, or to the end event of the string or whatever string event has defined. So, you can grab little pieces of information the string is sending along and know when the string is finished.

## Routing Requests
At this point, we have the URL pathname, the queryString, the method, the headers and the payload the user sends. In other words, we have all the data of request. Now, we're going to package it up into a nice object and send it to some request handler. 
So, our next task is to start defining some simple request handler that set up instructions for the HTTP server can look the request and router to the right handler it needs to go to. We're going to write requests based on the path the user is asking for. For example, if the user asks for '/users', that should go to the users handler. So, the first thing we need to do is to define an array that can match incoming paths to the respective handlers. Lastly, we want to set up the structure to allow any request that doesn't match.

```
// Set the handlers
let handlers = {};
// Sample handler
handlers.sample = function(data, callback){
	// Callback a http status code, and a payload object
	callback(406, {'name': 'sample handler'});
}

// Not found handler
handlers.notFound = function(data, callback){
	// Callback a status code, a payload object doesn't necessary
	callback(404);
}

// Set path and handlers
let router = {
	'sample': handlers.sampleHandler
}
```

The data the handlers receive is the data of everything containing the request. The callback is a function that has to call the instructions for the response, and it tells us two things: the status code, and a payload object.
Now, we need to modify the HTTP server, so that it figures out which handler to call depending on the path the user is requesting, and sends the data and then receives the callback data from the handler, and finally sends the response to the user.
We want to put all this logic into the 'end' event handler: 
```
req.on('end', function(){
	buffer += decoder.end();

	// Choose the handler the request should go to
	let chooseHandler = typeof(rounter[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

	// Construct the data object to send to the handler
	let data = {
		queryStringObject: queryStringObject,
		method: method,
		headers: headers,
		payload: buffer
	}

	//Route the request to the handler specified in the router
	chooseHandler(data, function(statusCode, payload){
		// Use the status code called back by the handler, or default to 200
		statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

		// Use the payload called back by the handler, or default to an empty object
		paload = typeof(payload) == 'object' ? payload : {};

		// Set the response
		let payloadString = JSON.stringify(payload);
		// Return the response
		res.setHeader('Content-Type', 'application/json');
		res.write(statusCode);
		res.end(payloadString);

	});
}):
```

## Adding Configuration
Now, we need to add a configuration file to store different configuration variables. Through this way, we can start the app in different ways for different environments. Rather than start the server with node index.js you'd like to say NODE_ENV=staging node index.js. In this case, 'staging' is the value of the environment variable defined in the config file.

Our configuration file creates and exports configuration variables for two environments, and it looks like this:
```
let environments = {};

// Staging (default) environment
environments.staging = {
	'port': 3000,
	'envName': 'staging'
};

// Production environment
environments.production = {
	'port': 5000,
	'envName': 'production'
};

// Determine which environment was passed as a command-line argument
let currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase : '';

// Check that the current environment is one of the environments above. If not, default to stagin.
let environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;
```

Once the config file is defined, we are going to use it whatever we need it. For example, when we want to start the server the port is different depending on the environment:

```
const config = require('config');
server.listen(config.port, function(){
	console.log(`The server is listening on port ${config.port} in ${config.envName} mode`);
});
```

## Adding HTTPS Support
We've created and http server that listens on a port in this app, but we've done anything with https. So, let's do it.
The first thing we are going to do is to create a certificate that we can use to facilitate the HTTP support. In order to create this certificate, we are going to use the open ssl. Previously, we're going to create a https directory into the app, and type in the console:
`open ssl req -newkey rsa:2048 -new -nodes -x509 -days 365 -keyout key.pem out cert.pem`
This creates a 2048 bit RSA private key after asking a few questions.
Now, we have the certificate we nedd we can create a HTTPS server. The first file we need to modify is the config file:
```
let environments = {};

// Staging (default) environment
environments.staging = {
	'httpPort': 3000,
	'httpsPort': 3001,
	'envName': 'staging'
};

// Production environment
environments.production = {
	'httpPort': 5000,
	'httpPort': 5001,
	'envName': 'production'
};

// Determine which environment was passed as a command-line argument
let currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase : '';

// Check that the current environment is one of the environments above. If not, default to stagin.
let environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;
```

But, in the index.js file we've created a handler for a HTTP server. So, we need to create a handler for a HTTS server too. Because both servers have the same basic functions, we need to refactor the index.js file.

We're going to create a function that handle all the unified server.
```
// All the server logic fot both: HTTP and HTTPS server
let unifiedServer = function(req, res){
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
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      payload: buffer,
    };

    // Choose the handler the request should go to
	let chooseHandler = typeof(rounter[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

	// Construct the data object to send to the handler
	let data = {
		queryStringObject: queryStringObject,
		method: method,
		headers: headers,
		payload: buffer
	}

	//Route the request to the handler specified in the router
	chooseHandler(data, function(statusCode, payload){
		// Use the status code called back by the handler, or default to 200
		statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

		// Use the payload called back by the handler, or default to an empty object
		paload = typeof(payload) == 'object' ? payload : {};

		// Set the response
		let payloadString = JSON.stringify(payload);
		// Return the response
		res.setHeader('Content-Type', 'application/json');
		res.write(statusCode);
		res.end(payloadString);
	});    
  });
};
```
Now, we need to modify the handlers for create http server and create https server:
```
const http = require('http');
const https = require('https');
const config = require('config');
const fs = require('fs');

// Instanciate the HTTP server
const httpServer = http.createServer(function(req, res){
	// Call to the unifiedServer function
	unifiedServer(req, res);
});

// HTTPS server options
const httpsServerOptions = {
	'key': fs.readSyncFile('./https/key.pem'),
	'cert': fs.readSyncFile('./https/cert.pem')
};

// Instanciate the HTTP server
const httpsServer = https.createServer(httpsServerOptions, function(req, res){
	// Call to the unifiedServer function
	unifiedServer(req, res);
});

// Start the HTTP server
httpServer.listen(config.httpPort, function(){
	console.log(`The server is listening on port ${config.httpPort} in ${config.envName} mode`);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, function(){
	console.log(`The server is listening on port ${config.httpsPort} in ${config.envName} mode`);
});
```

## The Tokens
Tokens are going to be the authentication mechanism for this application. Rather than sending the username and password with each request in order to authenticate it we are just going to have a created token with de user's id and password and then use that token for any request that require authentication. In order to do this, we'll create a new router called 'tokens' and its handler, and a new folder for token data into .data directory.
When the user is authenticated, a new token file is created. This token contains a random name, the user's id and an expiration date (1 hour in our case).

### Creating a Token via CURL
Type this command-line in console:
curl -i -X POST -H "Content-Type:application/json" http://localhost:3000/tokens -d '{"userId":"70e9a46dfb645d5905733b2df939fd29ae2774acb22904dd0280720980beda23","password":"342dd9d81c8d3a021b1316c323cb6be032204bd8a56753e86e7b210a887e4dd9"}'

We'll get an user token if the user exists.

### Getting a Token via CURL
curl http://localhost:3000/tokens?id=zcdq8tiz5u669h5vks9n

### Updating a Token
There's really no reason for sending put to the token service. There's nothing to modify about the token other than expiration time. But we don't want to allow the users to set an arbitrary expiration time. So, instead, we only allow sending an extend=true payload. If the "extend" sent is true, we'll extend the token out to one hour from this moment, and there's no other field that we want to update.

If you want to update a token expiration time, type this command-line in the console:
curl -i -X PUT -H "Content-Type:application/json" http://localhost:3000/tokens -d '{"id":"tzajbi6k98rq16jko7h6", "extend": true}'

### Using a Token
There will be some operations that will ask for a valid token. That's why we'll have to validate the token the user sent via the header object. 
For example, if we want to allow that only an authenticated user can update its own data, we'll need to validate the token data that the user sent.

The functions would look like this:
```
// ./controllers/user

```

### Example: Creating a user
curl -i -X POST -H "Content-Type:application/json" http://localhost:3000/users -d '{"firstName":"Maria","lastName":"Barros", "username": "marriaisabel.bp@gmail.com", "password": "libertad2012", "role":"user"}'

### Example: Creating a user token
curl -i -X POST -H "Content-Type:application/json" http://localhost:3000/tokens -d '{"userId":"c154eee7faae70fc5b3ef97eb906b6be8311f165ab2b39fb28febdce79f6c52d", "password": "1525d9c66d813a8fd5bc3ee6cbeb06a9d790e09c279267d0137cbba05d7a000a"}'

### Example: Getting user sending a token
curl -X GET -H "Content-Type:application/json" -H "token:sryvy4ju9jv4lk09tvme"  http://localhost:3000/users?id=c154eee7faae70fc5b3ef97eb906b6be8311f165ab2b39fb28febdce79f6c52d

### Example: Updating user data
curl -i -X PUT -H "Content-Type:application/json" -H "token:sryvy4ju9jv4lk09tvme" http://localhost:3000/users -d '{"id":"c154eee7faae70fc5b3ef97eb906b6be8311f165ab2b39fb28febdce79f6c52d","firstName":"Maria Isabel"}'

### Example: Deleting a user
curl -i -X DELETE -H "Content-Type:application/json" -H "token:vl6a278nevkhhy5vj4hl" http://localhost:3000/users -d '{"id":"c154eee7faae70fc5b3ef97eb906b6be8311f165ab2b39fb28febdce79f6c52d"}'

### Example: Updating user token
curl -i -X PUT -H "Content-Type:application/json" http://localhost:3000/tokens -d '{"id":"sryvy4ju9jv4lk09tvme","extend":true}'

## The Checks
Checks protect the server from overloads. 

The checks are tasks that say our system: "go and check this url every x number of seconds, and then tell the user (the creator of the check) whether the url is up or down".

We are going to allow the user to create up to five checks and later on we'll go about building background processes that will perform the checking.

First, let's go creating the check service with a post, get, put and delete that allows the user who's logged in and got a token, to create up to five checks and had those checks listed in its account.

### Example: Creating a user check
curl -i -X POST -H "Content-Type:application/json" -H "token:vl6a278nevkhhy5vj4hl" http://localhost:3000/checks -d '{"protocol":"http", "method": "get", "url": "google.com", "successCodes": [200,201], "timeoutSeconds": "3"}'

### Example: Getting a user check
curl -i -X GET -H "Content-Type:application/json" -H "token:mg682ja56gpn01i85ipz" http://localhost:3000/checks?id=qgp3r37enh7n6w6hg2x6

### Example: Updating a user check
curl -i -X PUT -H "Content-Type:application/json" -H "token:mg682ja56gpn01i85ipz" http://localhost:3000/checks -d '{"id":"qgp3r37enh7n6w6hg2x6","protocol":"https"}'

### Example: Deleting a user check
curl -i -X DELETE -H "Content-Type:application/json" -H "token:mg682ja56gpn01i85ipz" http://localhost:3000/checks -d '{"id":"g7itzjitiesutj70hvpa"}'

## Connecting to an API
One of the most common task that we are going have to do is integrate with another API. Many developers would need to go to the third parties and look for a NodeJS library they provide or look for NodeJS NPM library that someone else has written for interacting with that API.

But there's another way to integrate an API. You can simply craft HTTP messages or HTTPS messages and send them off the third party API. 

For this app, we want to integrate with Twilio, a service that provides and manipulates phone numbers in order to take or receive calls or SMS messages o video calls, or something like that.

With Twilio, we'll send SMS alerts to the users telling them if their checks are up or down. Before we do that full integration, we'd like to write a little library that integrates with Twilio and allows us to send an SMS message.

So, we are going to create a new function in the helpers to send an SMS message.

## Contributing
Fork this project
Clone it from your Github profile
Add remote url 

```git remote -v
git remote add upstream https://```

Make your contribution

### Syncing the fork
Fetch the branches and their respective commits from the upstream repository  `git fetch upstream`.  Commits to `master` will be stored in a local branch, `upstream/master`.
Check out your fork's local master branch `git checkout master`
Merge the changes from `upstream/master` into your local `master` branch. This brings your fork's `master` branch into sync with the upstream repository, without losing your local changes. `git merge upstream/master`.

## License
[MIT](https://choosealicense.com/licenses/mit/)