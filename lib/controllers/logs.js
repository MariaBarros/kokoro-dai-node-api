/*
 * Library for storing and rotating logs
 *
 */

// Dependencies
let fs = require('fs');
let path = require('path');
let zlib = require('zlib');

// Container for module (to be exported)
let lib = {};

// Base directory of data folder
lib.baseDir = path.join(__dirname,'../../.logs/');

const openFile = (file, option)=>{
  return new Promise((resolve, reject)=>{
    fs.open(`${lib.baseDir}${file}`, option, function(err, fileDescriptor){
      if(err){
        reject(err);
      }else{
        resolve(fileDescriptor);
      }
    });
  });
}

const closeFile = (fileDescriptor)=>{
  return new Promise((resolve, reject)=>{
    fs.close(fileDescriptor, function(err){
      if(!err){
        resolve();        
      }else{
        reject(err);
      }
    }); 
  });
};

const writeFile = (fileDescriptor, data)=>{
  return new Promise((resolve, reject) =>{
    fs.writeFile(fileDescriptor, data,function(err){
      if(err){
        reject(err);
      }else{
        resolve();
      }
    });
  });
}

// Append a string to a file. Create the file if it does not exist
lib.append = function(file, str){

  return new Promise((resolve, reject) => {
    // Open the file for appending
    openFile(`${file}.log`,'a').then((fileDescriptor)=>{
      // Append to file and close it
      fs.appendFile(fileDescriptor, str+'\n', function(err){
        if(err){
          reject(err);          
        }else{
          closeFile(fileDescriptor).then(()=>{
            resolve();
          }, (err) => {
            reject(err);
          });          
        }        
      });
    }, (err) => {
      reject(err);
    })
  });    
  
};

// List all the logs, and optionally include the compressed logs
lib.list = function(includeCompressedLogs){
  return new Promise((resolve, reject) => {
    fs.readdir(lib.baseDir, function(err,data){
      if(!err && data && data.length > 0){
        let trimmedFileNames = [];
        data.forEach(function(fileName){

          // Add the .log files
          if(fileName.indexOf('.log') > -1){
            trimmedFileNames.push(fileName.replace('.log',''));
          }

          // Add the .gz files
          if(fileName.indexOf('.gz.b64') > -1 && includeCompressedLogs){
            trimmedFileNames.push(fileName.replace('.gz.b64',''));
          }

        });
        resolve(trimmedFileNames);
      } else {
        reject(err,data);
      }
    });  

  });
  
};

// Compress the contents of one .log file into a .gz.b64 file within the same directory
lib.compress = function(logId, newFileId){    

  return new Promise((resolve, reject) => {
    // Read the source file
    fs.readFile(`${lib.baseDir}${logId}.log`, 'utf8', function(err,inputString){
      if(!err && inputString){
        // Compress the data using gzip
        zlib.gzip(inputString,function(errZip, buffer){
          if(!errZip && buffer){
            // Send the data to the destination file
            const destFile = `${newFileId}.gz.b64`;

            openFile(destFile, 'wx').then((fileDescriptor) => {
              writeFile(fileDescriptor, buffer.toString('base64')).then(()=>{
                // Close the destination file
                closeFile(fileDescriptor).then(()=>{
                  resolve();
                }, (errClose) => {
                  reject(errClose);
                }); 
              },(errWrite) => {
                reject(errWrite);
              });
            }, (errOpen) => {
              reject(errOpen);
            });
            
          } else {
            reject(errZip);
          }
        });

      } else {
        reject(err);
      }
    });
  });

};

// Decompress the contents of a .gz file into a string variable
lib.decompress = function(fileId){
  const fileName = `${lib.baseDir}${fileId}.gz.b64`;

  return new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf8', function(err, str){
      if(!err && str){
        // Inflate the data
        const inputBuffer = Buffer.from(str, 'base64');
        zlib.unzip(inputBuffer, function(err, outputBuffer){
          if(!err && outputBuffer){
            // Callback
            const str = outputBuffer.toString();
            resolve(str);
          } else {
            reject(err);
          }
        });
      } else {
        reject(err);
      }
    });
  });
  
};

// Truncate a log file
lib.truncate = function(logId){
  return new Promise((resolve, reject) => {
    fs.truncate(lib.baseDir+logId+'.log', 0, function(err){
      if(!err){
        resolve();
      } else {
        reject(err);
      }
    });  
  });
  
};

// Export the module
module.exports = lib;
