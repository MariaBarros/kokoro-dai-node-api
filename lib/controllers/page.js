/*------------------------------------------------------**
** Dependencies - Models & Data                         **
**------------------------------------------------------*/
const config = require('../config/page');
const helpers = require('../helpers/template');

const pageCtrl = {};

/*------------------------------------------------------**
** Get page content                                     **
**------------------------------------------------------**
* @param {String} templateName: check's id              **
**------------------------------------------------------*/
pageCtrl.getContent = function(templateName, method, callback){
  // Reject any request that isn't a GET
  if(method == 'get'){
    // Prepare data for interpolation    
    templateData = config[templateName];
    // Read in a template as a string
    helpers.getTemplate(templateName,templateData,function(err,str){
      if(!err && str){
        // Add the universal header and footer
        helpers.addUniversalTemplates(str,templateData, function(err,str){
          if(!err && str){
            // Return that page as HTML
            callback(200,str,'html');
          } else
            callback(500,undefined,'html');
        });
      } else
        callback(500,undefined,'html');
    });    
  }else{
    callback(405, undefined, 'html');
  }

};

/*------------------------------------------------------**
** Get favicon                                          **
**------------------------------------------------------**/
pageCtrl.getFavicon = function(callback){
  helpers.getStaticAsset('favicon.ico',function(err,data){
    if(!err && data){
      // Callback the data
      callback(200,data,'favicon');
    } else
      callback(500);
  });    
};

/*------------------------------------------------------**
** Get public asset                                     **
**------------------------------------------------------**
* @param {Object} trimmedAssetName: Resourse name       **
**------------------------------------------------------*/
pageCtrl.getPublicAsset = function(trimmedAssetName, callback){
  if(trimmedAssetName.length > 0){
    // Read in the asset's data
    helpers.getStaticAsset(trimmedAssetName,function(err,data){
      if(!err && data){
        // Determine the content type (default to plain text)
        let contentType = helpers.getTypeContent(trimmedAssetName);          
        // Callback the data
        callback(200,data,contentType);
      } else
        callback(404);
    });
  } else
    callback(404);  
};


// Export the handlers for users checks
module.exports = pageCtrl;