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
pageCtrl.getContent = function(templateName, method){
  // Reject any request that isn't a GET
  if(method !== 'get'){
    return Promise.reject({code: 405, type: 'html'});
  }
  
  // Prepare data for interpolation    
  templateData = config[templateName];

  return new Promise((resolve, reject)=>{
    // Read in a template as a string
    helpers.getTemplate(templateName, templateData,function(err, str){
      if(!err && str){
        // Add the universal header and footer
        helpers.addUniversalTemplates(str,templateData, function(err, str){
          if(!err && str){
            // Return that page as HTML
            resolve({content:str, type:'html'});
          } else{
            reject(500);
          }
        });
      } else{
        reject(500);
      }
    });    
  });  

};

/*------------------------------------------------------**
** Get favicon                                          **
**------------------------------------------------------**/
pageCtrl.getFavicon = function(){
  return new Promise((resolve, reject) => {
    helpers.getStaticAsset('favicon.ico',function(err,data){
      if(!err && data){
        // Callback the data
        resolve({content: data, type:'favicon'});
      } else
        reject(404);
    });
  });
  
};

/*------------------------------------------------------**
** Get public asset                                     **
**------------------------------------------------------**
* @param {Object} trimmedAssetName: Resourse name       **
**------------------------------------------------------*/
pageCtrl.getPublicAsset = function(trimmedAssetName){
  if(trimmedAssetName.length === 0){
    return Promise.reject(404);
  }

  // Read in the asset's data
  return new Promise((resolve, reject) => {
    helpers.getStaticAsset(trimmedAssetName, function(err, data){
      if(!err && data){
        // Determine the content type (default to plain text)
        const contentType = helpers.getTypeContent(trimmedAssetName);          
        // Callback the data
        resolve({content: data, type: contentType});
      } else
        reject(404);
    });
  });  
  
};


// Export the handlers for users checks
module.exports = pageCtrl;