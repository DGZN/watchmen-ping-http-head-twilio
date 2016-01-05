var request = require('request'),
     client = require('twilio')(process.env.TWILIO_ACCOUNT_SID || '', process.env.TWILIO_AUTH_TOKEN || '');

function PingService() {}

exports = module.exports = PingService;

PingService.prototype.ping = function (service, callback) {
  var self = this;
  var startTime = +new Date();
  var options = {
    method: 'HEAD',
    uri: service.url,
    timeout: service.timeout
  };

  var expectedStatusCode = 200;

  var serviceOptions = (service.pingServiceOptions && service.pingServiceOptions['http-head-twilio']) || {};
  if (serviceOptions.statusCode && serviceOptions.statusCode.value) {
    expectedStatusCode = parseInt(serviceOptions.statusCode.value, 10);
  }

  request.get(options, function (error, response, body) {
    if (error) {
      self.sendTwilioAlert(service, '@error _'+error.stack+'_')
      return callback(error, body, response, +new Date() - startTime);
    }
    if (response && response.statusCode != expectedStatusCode) {
      var errMsg = 'Invalid status code. Found: ' + response.statusCode +
          '. Expected: ' + expectedStatusCode;
      self.sendTwilioAlert(service, '@invalidStatusCode _'+response.statusCode+'_')
      return callback(errMsg, body, response, +new Date() - startTime);
    }
    callback(null, body, response, +new Date() - startTime);
  });
};

PingService.prototype.getDefaultOptions = function () {
  return {
    'statusCode': {
      descr: 'Expected status code (defaults to 200)',
      required: false
    }
  };
};

PingService.prototype.sendTwilioAlert = function (service, message) {
  console.log("SERVICE", service)
  client.sendMessage({
    to:   process.env.TWILIO_SMS_TO   || '',
    from: process.env.TWILIO_SMS_FROM || '',
    body: service.name + ' :: ' + message
  }, function(error, data) {
    if (error)
      return console.log(require('util').inspect({
        message: '@errorDeliveringSMS'
      , error:   error
      }, { depth: null }));
  });
};
