/*------------------------------------------------------**
** Create and export configuration variables            **
**------------------------------------------------------*/

// Container for all environments
var environments = {};

// Staging (default) environment
environments.staging = {
  'httpPort' : 3000,
  'httpsPort': 3001,
  'envName' : 'staging',
  'hashingSecret' : 'thisIsASecret',
  'maxChecks': 5,
  'twilio' : {
    'accountSid' : 'AC021512425cedba8ad71947e32bb48479',
    'authToken' : 'a34df4baa71d198f8961d2f36307a931',
    'fromPhone' : '+15005550006'
  }
};

// Production environment
environments.production = {
  'httpPort' : 5000,  
  'httpsPort' : 5001,  
  'envName' : 'production',
  'hashingSecret' : 'thisIsAlsoASecret',
  'maxChecks': 5,
  'twilio' : {
    'accountSid' : '',
    'authToken' : '',
    'fromPhone' : ''
  }
};

// Determine which environment was passed as a command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above, if not default to staging
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;