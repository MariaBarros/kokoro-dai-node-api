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

const openFile = (source, file, option)=>{
  return new Promise((resolve, reject)=>{
    fs.open(`${baseDir}${source}/${file}.json`, option, function(err, fileDescriptor){
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

// Write data to a file
lib.create = function(source, file, data, callback){
  return new Promise((resolve, reject)=>{
    // Open the file for writing
    openFile(source, file, 'wx').then((fileDescriptor)=>{
      // Convert data to string
      const stringData = JSON.stringify(data);
      //
      writeFile(fileDescriptor, stringData).then(()=>{
        closeFile(fileDescriptor).then(()=>{
          resolve();
        }, (err)=>{
          reject(err);
        });
      }, (err)=>{
        reject(err);
      });
    });

  });  

};

// Read data from a file
lib.read = function(source, file){

  return new Promise((resolve, reject)=>{
    fs.readFile(`${baseDir}${source}/${file}.json`, 'utf8', function(err,data){
      if(!err && data){
        var parsedData = helpers.parseJsonToObject(data);
        resolve(parsedData);
      } else
        reject(err);
      });
  });
  
};

// Update data in a file
lib.update = function(source, file, data){
  return new Promise((resolve, reject)=>{    

    // Open the file for writing
    openFile(source, file, 'r+').then((fileDescriptor)=>{
      // Truncate the file
      fs.ftruncate(fileDescriptor,function(err){
        if(err){
          reject(err);
          return;
        }
        
        // Convert data to string
        const stringData = JSON.stringify(data);
        // Write to file and close it
        writeFile(fileDescriptor, stringData).then(()=>{
          closeFile(fileDescriptor).then(()=>{
            resolve();
          }, (err)=>{
            reject(err);
          });
        }, (err)=>{
          reject(err);
        });        

      });
    }, (err)=>{
      reject(err);
    });

  });

};

// Delete a file
lib.delete = function(source, file){

  return new Promise((resolve, reject) =>{
    // Unlink the file from the filesystem
    fs.unlink(`${baseDir}${source}/${file}.json`, function(err){
      if(err){
        reject(err)
      }else{
        resolve();
      }      
    });  
  });  

};

// List all the items in a directory
lib.list = function(source){
  return new Promise((resolve, reject) =>{    

    fs.readdir(`${baseDir}${source}/`, (err, data)=>{

      if(err){
        reject(err);
        return;
      }

      let trimmedFileNames = [];
      data.forEach((fileName) =>{
        trimmedFileNames.push(fileName.replace('.json',''));
      });
      resolve(trimmedFileNames);      
    });

  });
  
};

// Export the module
module.exports = lib;