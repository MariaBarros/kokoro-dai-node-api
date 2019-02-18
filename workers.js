/*
 * Worker-related tasks
 *
 */

 // Dependencies
let _logs = require('./controllers/logs');
let util = require('util');
let debug = util.debuglog('workers');
let _workerCtrl = require('./controllers/worker');

// Instantiate the worker module object
let workers = {};

// Lookup all checks, get their data, send to validator
workers.gatherAllChecks = function(){
  // Get all the checks
  _workerCtrl.getAvailableChecks(function(err, checks){    
    if(!err && checks.length > 0){      
      checks.forEach(function(check){        
        if(_workerCtrl.isValidCheck(check)){          
          // Pass the data along to the next step in the process
          _workerCtrl.performCheck(check, workers.processCheckOutcome);          
        }else
          debug("Error: one of the checks is not properly formatted. Skipping.");
      });
    }else{
      if(!err)
        debug("Couldn't find any check to precess.");
      else
        debug("Error reading one of the check's data: ",err);  
    }    
  });  
};

/*--------------------------------------------------------------**
** Process the check outcome, update the check data as needed   **
**--------------------------------------------------------------**
* @param {Object} originalCheckData, checkOutcome               **
**--------------------------------------------------------------*/
workers.processCheckOutcome = function(originalCheckData,checkOutcome){  
  if(!checkOutcome.sent){
    // Decide if the check is considered up or down
    let state = !checkOutcome.error && checkOutcome.responseCode && originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down',
    // Decide if an alert is warranted
      alertWarranted = originalCheckData.lastChecked && originalCheckData.state !== state;  

    // Log the outcome
    let logData = {
      'check' : originalCheckData,
      'outcome' : checkOutcome,
      'state' : state,
      'alert' : alertWarranted,
      'time' : Date.now()
    };    

    workers.log(logData);

    // Update the check data
    var newCheckData = originalCheckData;
    newCheckData.state = state;
    newCheckData.lastChecked = logData.time;

    // Save the updates
    _workerCtrl.updateCheck(newCheckData, function(err){
      if(!err){
        checkOutcome.sent = true;
        if(alertWarranted){
          let msg = 'Alert: Your check for '+newCheckData.method.toUpperCase()+' '+newCheckData.protocol+'://'+newCheckData.url+' is currently '+newCheckData.state;
          _workerCtrl.sendNotification(newCheckData.userPhone, msg, function(err){
            if(!err)
              debug("Success: User was alerted to a status change in their check, via sms: ",msg);
            else
              debug("Error: Could not send sms alert to user who had a state change in their check",err);          
          });
        }else
          debug("Check outcome has not changed, no alert needed");        
      }else    
        debug("Error trying to save updates to one of the checks");
    });
  }
};

/*--------------------------------------------------------------**
** Send check data to a log file                                **
**--------------------------------------------------------------**
* @param {Object} logData                                       **
**--------------------------------------------------------------*/
workers.log = function(logData){  
  // Convert the data to a string
  let logString = JSON.stringify(logData),
  // Determine the name of the log file
    logFileName = logData.check.id;

  // Append the log string to the file
  _logs.append(logFileName, logString, function(err){
    if(!err){
      debug("Logging to file succeeded");
    } else {
      debug("Logging to file failed");
    }
  });
};

// Timer to execute the worker-process once per minute
workers.loop = function(){
  setInterval(function(){
    workers.gatherAllChecks();
  },1000 * 60);
};

// Rotate (compress) the log files
workers.rotateLogs = function(){
  // List all the (non compressed) log files
  _logs.list(false,function(err,logs){
    if(!err && logs && logs.length > 0){
      logs.forEach(function(logName){
        // Compress the data to a different file
        var logId = logName.replace('.log','');
        var newFileId = logId+'-'+Date.now();
        _logs.compress(logId,newFileId,function(err){
          if(!err){
            // Truncate the log
            _logs.truncate(logId,function(err){
              if(!err){
                debug("Success truncating logfile");
              } else {
                debug("Error truncating logfile");
              }
            });
          } else {
            debug("Error compressing one of the log files.",err);
          }
        });
      });
    } else {
      debug('Error: Could not find any logs to rotate');
    }
  });
};

// Timer to execute the log-rotation process once per day
workers.logRotationLoop = function(){
  setInterval(function(){
    workers.rotateLogs();
  },1000 * 60 * 60 * 24);
}

// Init script
workers.init = function(){
  // Send to console, in yellow
  console.log('\x1b[33m%s\x1b[0m','Background workers are running');

  // Execute all the checks immediately
  workers.gatherAllChecks();
  // Call the loop so the checks will execute later on
  workers.loop();
  // Compress all the logs immediately
  workers.rotateLogs();
  // Call the compression loop so checks will execute later on
  workers.logRotationLoop();
};

 // Export the module
 module.exports = workers;