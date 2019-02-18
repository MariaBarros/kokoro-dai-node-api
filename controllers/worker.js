/*------------------------------------------------------**
** Dependencies - Models & Data                         **
**------------------------------------------------------*/
let https = require('https');
let http = require('http');

let _Check = require('../models/check');
let _checkCtrl = require('../controllers/check');

let helpers = require('../helpers/index');
let url = require('url');
let path = require('path');
let config = require('../config');

const workerCtrl = {};

/*------------------------------------------------------**
** Get all available checks                             **
**------------------------------------------------------*/
workerCtrl.getAvailableChecks = function(callback){
  _checkCtrl.getAll(function(err, checks){
    if(err && checks.length)
      callback(500,{message: 'Error when trying to get all available checks.'});
    else
      callback(false, checks);
  });  
};

/*------------------------------------------------------**
** Preparing check data for request                     **
**------------------------------------------------------**/
workerCtrl.performCheck = function(originalCheckData, callback){
  originalCheckData = _Check.perform(originalCheckData);

  // Prepare the intial check outcome
  const checkOutcome = {
    'error' : false,
    'responseCode' : false,
    'sent' : false // Mark that the outcome has not been sent yet
  };  

  // Parse the hostname and path out of the originalCheckData
  let parsedUrl = url.parse(originalCheckData.protocol +'://' + originalCheckData.url, true);
  
  // Construct the request
  let requestDetails = {
    'protocol' : originalCheckData.protocol,
    'hostname' : parsedUrl.hostname,
    'method' : originalCheckData.method.toUpperCase(),
    'path' : originalCheckData.path, // Using path not pathname because we want the query string
    'timeout' : originalCheckData.timeoutSeconds * 1000
  };

  this.checkRequest(requestDetails, checkOutcome, function(outcome){
    outcome = {...checkOutcome, ...outcome};    
    //Send the originalCheck data and the outcome of the check process to the next step    
    callback(originalCheckData, outcome);
  });  
}

/*------------------------------------------------------**
** Make check request                                   **
**------------------------------------------------------**/
workerCtrl.checkRequest = function(requestDetails, checkOutcome, callback){
  // Instantiate the request object (using either the http or https module)
  let _moduleToUse = requestDetails.protocol == 'http' ? http : https;

  requestDetails.protocol += ':';

  let req = _moduleToUse.request(requestDetails, function(res){
    // Grab the status of the sent request      
    callback({responseCode: res.statusCode});      
  });

  // Bind to the error event so it doesn't get thrown
  req.on('error',function(e){
    // Update the checkOutcome and pass the data along    
    callback({error: {'error' : true, 'value' : e}});
  });

  // Bind to the timeout event
  req.on('timeout',function(){
    // Update the checkOutcome and pass the data along    
    callback({error: {'error' : true, 'value' : 'timeout'}});      
  });

  // End the request
  req.end();  

};  

/*------------------------------------------------------**
** Handler for validating the check data                **
**------------------------------------------------------**
* @param {Object} data: Info about the request Object   **
**------------------------------------------------------*/
workerCtrl.isValidCheck = function(check){    
  return helpers.isObject(check) && _Check.hasRequiredProperties(check);
};

workerCtrl.updateCheck = function(newCheckData, callback){
  // Save the updates
  _checkCtrl.update(newCheckData, function(err){
    callback(err);
  });
}

/*------------------------------------------------------**
** Handler for sending notification                     **
**------------------------------------------------------**
* @param {String} phone: user's phone                   **
* @param {String} msg: the message to send              **
**------------------------------------------------------*/
workerCtrl.sendNotification = function(phone, msg, callback){          
  // Alert the user as to a change in their check status        
  helpers.sendTwilioSms(phone, msg , function(err){
    if(err)
      callback({error:err,phone: phone, msg: msg});
    else
      callback(false);
   });
};
  
// Export the handlers for workers
module.exports = workerCtrl;