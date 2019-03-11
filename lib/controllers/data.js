/*------------------------------------------------------**
** Library for storing and editing data                 **
**------------------------------------------------------*/

// Dependencies
let fs = require('fs');
let path = require('path');
let helpers = require('../helpers/index');
let baseDir = path.join(__dirname,'/../../.data/');

// Container for module (to be exported)
let lib= {};

// Write data to a file
lib.create = function(source,file,data,callback){
  // Open the file for writing
  fs.open(baseDir + source + '/' + file + '.json', 'wx', function(err, fileDescriptor){
    if(!err && fileDescriptor){
      // Convert data to string
      var stringData = JSON.stringify(data);

      // Write to file and close it
      fs.writeFile(fileDescriptor, stringData,function(err){
        if(!err){
          fs.close(fileDescriptor,function(err){
            if(!err)  
              callback(false);
            else
              callback('Error closing new file');            
          });
        } else
          callback('Error writing to new file');
      });
    } else
      callback('Could not create new file, it may already exist');
  });

};

// Read data from a file
lib.read = function(source,file,callback){
  fs.readFile(baseDir + source + '/' + file + '.json', 'utf8', function(err,data){
    if(!err && data){
      var parsedData = helpers.parseJsonToObject(data);
      callback(false,parsedData);
    } else
      callback(err,data);
  });
};

// Update data in a file
lib.update = function(source,file,data,callback){

  // Open the file for writing
  fs.open(baseDir+ source + '/' + file + '.json', 'r+', function(err, fileDescriptor){
    if(!err && fileDescriptor){
      // Convert data to string
      var stringData = JSON.stringify(data);

      // Truncate the file
      fs.truncate(fileDescriptor,function(err){
        if(!err){
          // Write to file and close it
          fs.writeFile(fileDescriptor, stringData,function(err){
            if(!err){
              fs.close(fileDescriptor,function(err){
                if(!err)
                  callback(false);
                else
                  callback('Error closing existing file');
              });
            } else
              callback('Error writing to existing file');
          });
        } else
          callback('Error truncating file');
      });
    } else
      callback('Could not open file for updating, it may not exist yet');
  });
};

// Delete a file
lib.delete = function(source,file,callback){

  // Unlink the file from the filesystem
  fs.unlink(baseDir + source + '/' + file + '.json', function(err){
    callback(err);
  });

};

// List all the items in a directory
lib.list = function(source,callback){
  fs.readdir(baseDir + source + '/', function(err,data){
    if(!err && data && data.length > 0){
      var trimmedFileNames = [];
      data.forEach(function(fileName){
        trimmedFileNames.push(fileName.replace('.json',''));
      });
      callback(false,trimmedFileNames);
    } else {
      callback(err,data);
    }
  });
};

// Export the module
module.exports = lib;