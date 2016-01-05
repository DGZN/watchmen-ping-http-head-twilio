var request = require('request'),
     client = require('twilio')('ACCOUNT_SID', 'AUTH_TOKEN');

function PingService() {
}

exports = module.exports = PingService;

PingService.prototype.ping = function (service, callback) {
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
      PingService.sendTwilioAlert(service)
      return callback(error, body, response, +new Date() - startTime);
    }
    if (response && response.statusCode != expectedStatusCode) {
      var errMsg = 'Invalid status code. Found: ' + response.statusCode +
          '. Expected: ' + expectedStatusCode;
      PingService.sendTwilioAlert(service)
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

PingService.prototype.sendTwilioAlert = function () {
  client.sendMessage({
    to:   '',             // Any number Twilio can deliver to
    from: '',            // A number you bought from Twilio and can use for outbound communication
    body: service.name + ' :: ' serviceOptions.statusCode.value
  }, function(error, data) {
    if (error)
      return console.log(require('util').inspect({
        message: '@errorDeliveringSMS'
      , error:   error
      }, { depth: null }));
  });
};
