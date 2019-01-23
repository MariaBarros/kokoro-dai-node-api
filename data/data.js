/*------------------------------------------------------**
** Library for storing and editing data                 **
**------------------------------------------------------*/

// Dependencies
let fs = require('fs');
let path = require('path');
let helpers = require('../helpers/index');
let baseDir = path.join(__dirname,'/../data/');

// Container for module (to be exported)
let data= {};

// Write data to a file
data.create = function(source,data,callback){
  // Open the file for writing
  fs.open(baseDir + '/' + source + '.json', 'wx', function(err, fileDescriptor){
    if(!err && fileDescriptor){
      // Convert data to string
      let stringData = JSON.stringify(data);

      // Write to file and close it
      fs.writeFile(fileDescriptor, stringData, function(err){
        if(!err){
          fs.close(fileDescriptor,function(err){
            if(!err){
              callback(false);
            } else {
              callback('Error closing new file');
            }
          });
        } else {
          callback('Error writing to new file');
        }
      });
    } else {
      callback('Could not create new file, it may already exist');
    }
  });

};

// Read data from a file
data.read = function(source, callback){
  fs.readFile(baseDir + '/' + source + '.json', 'utf8', function(err,data){
    if(!err && data){
      let parsedData = helpers.parseJsonToObject(data);
      callback(false,parsedData);
    } else {
      callback(err,data);
    }
  });
};

// Update data in a file
data.update = function(source, data, callback){

  // Open the file for writing
  fs.open(baseDir + source + '.json', 'r+', function(err, fileDescriptor){
    if(!err && fileDescriptor){
      // Convert data to string
      let stringData = JSON.stringify(data);

      // Truncate the file
      fs.truncate(fileDescriptor,function(err){
        if(!err){
          // Write to file and close it
          fs.writeFile(fileDescriptor, stringData,function(err){
            if(!err){
              fs.close(fileDescriptor,function(err){
                if(!err){
                  callback(false);
                } else {
                  callback('Error closing existing file');
                }
              });
            } else {
              callback('Error writing to existing file');
            }
          });
        } else {
          callback('Error truncating file');
        }
      });
    } else {
      callback('Could not open file for updating, it may not exist yet');
    }
  });

};

// Delete a file
data.delete = function(source, id ,callback){

};

// Export the module
module.exports = data;