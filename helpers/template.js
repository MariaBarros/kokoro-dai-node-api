/*
 * Helpers for various tasks
 *
 */

// Dependencies
var config = require('../config');
var path = require('path');
var fs = require('fs');

// Container for all the helpers
var template = {};

/*------------------------------------------------------**
** Get string content of a template                     **
**------------------------------------------------------**
* @param {String} templateName                          **
**------------------------------------------------------*/
template.getTemplate = function(templateName,data,callback){
  templateName = typeof(templateName) == 'string' && templateName.length > 0 ? templateName : false;
  data = typeof(data) == 'object' && data !== null ? data : {};
  if(templateName){
    var templatesDir = path.join(__dirname,'/../templates/');
    fs.readFile(templatesDir+templateName+'.html', 'utf8', function(err,str){
      if(!err && str && str.length > 0){
        // Do interpolation on the string
        var finalString = template.interpolate(str,data);
        callback(false,finalString);
      } else {
        callback('No template could be found');
      }
    });
  } else {
    callback('A valid template name was not specified');
  }
};

/*------------------------------------------------------**
** Add the universal header and footer to a string,     **
** and pass provided data object to header and footer   **
** for interpolation                                    ** 
**------------------------------------------------------**
* @param {String} str: template content                 **
**------------------------------------------------------*/
template.addUniversalTemplates = function(str,data,callback){
  str = typeof(str) == 'string' && str.length > 0 ? str : '';
  data = typeof(data) == 'object' && data !== null ? data : {};
  // Get the header
  template.getTemplate('_header',data,function(err,headerString){
    if(!err && headerString){
      // Get the footer
      template.getTemplate('_footer',data,function(err,footerString){
        if(!err && headerString){
          // Add them all together
          var fullString = headerString+str+footerString;
          callback(false,fullString);
        } else {
          callback('Could not find the footer template');
        }
      });
    } else {
      callback('Could not find the header template');
    }
  });
};

/*------------------------------------------------------**
** Take a given string and data object,                 **
** and find/replace all the keys within it              **
**------------------------------------------------------**
* @param {String} str: template content                 **
**------------------------------------------------------*/
template.interpolate = function(str,data){
  str = typeof(str) == 'string' && str.length > 0 ? str : '';
  data = typeof(data) == 'object' && data !== null ? data : {};

  // Add the templateGlobals to the data object, prepending their key name with "global."
  for(var keyName in config.templateGlobals){
     if(config.templateGlobals.hasOwnProperty(keyName)){
       data['global.'+keyName] = config.templateGlobals[keyName]
     }
  }
  // For each key in the data object, insert its value into the string at the corresponding placeholder
  for(var key in data){
     if(data.hasOwnProperty(key) && typeof(data[key] == 'string')){
        var replace = data[key];
        var find = '{'+key+'}';
        str = str.replace(find,replace);
     }
  }
  return str;
};

// Get the contents of a static (public) asset
template.getStaticAsset = function(fileName,callback){
  fileName = typeof(fileName) == 'string' && fileName.length > 0 ? fileName : false;
  if(fileName){
    var publicDir = path.join(__dirname,'/../public/');
    fs.readFile(publicDir+fileName, function(err,data){
      if(!err && data){
        callback(false,data);
      } else {
        callback('No file could be found');
      }
    });
  } else {
    callback('A valid file name was not specified');
  }
};

template.getTypeContent = function(assetName){
  let contentType = 'plain';
  if(assetName.indexOf('.css') > -1){
    contentType = 'css';
  }else{
    if(assetName.indexOf('.png') > -1){
      contentType = 'png';
    }else{
      if(assetName.indexOf('.jpg') > -1){
        contentType = 'jpg';
      }else{
        if(assetName.indexOf('.ico') > -1){
          contentType = 'favicon';
        }
      }
    }
  }
  return contentType;       
}

// Export the module
module.exports = template;