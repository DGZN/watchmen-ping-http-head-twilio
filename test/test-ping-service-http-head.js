var assert = require('assert');
var proxyquire = require('proxyquire');

describe('ping service http-head-twilio', function () {

  var service;

  beforeEach(function () {
    service = {
      url: 'http://google.com',
      pingServiceOptions: {
        'http-head-twilio': {
          statusCode: {
            descr: 'expected status code',
            required: false,
            value: 200
          }
        }
      }
    }
  });

  function loadHttpHeadServiceWithMockedResponse(statusCode) {
    var HTTPHeadService = proxyquire('../index', {
      'request': {
        get: function (options, cb) {
          cb(null, {statusCode: statusCode}, '');
        }
      }
    });
    return new HTTPHeadService();
  }

  it('should expect status code of 200 if no configuration is found', function (done) {
    delete service.pingServiceOptions['http-head-twilio'];
    var pingService = loadHttpHeadServiceWithMockedResponse(200);
    pingService.ping(service, function (error) {
      assert.ifError(error);
      done();
    });
  });

  it('should fail if statusCode does not match', function (done) {
    service.pingServiceOptions['http-head-twilio'].statusCode.value = 200;
    var pingService = loadHttpHeadServiceWithMockedResponse(201);
    pingService.ping(service, function (error) {
      assert.ok(error.indexOf('Invalid status code') === 0);
      done();
    });
  });

  it('should handle invalid configuration statusCode', function (done) {
    service.pingServiceOptions['http-head-twilio'].statusCode.value = 'notanumber';
    var pingService = loadHttpHeadServiceWithMockedResponse(200);
    pingService.ping(service, function (error) {
      assert.ok(error.indexOf('Invalid status code') === 0);
      assert.ok(error.indexOf('Expected: NaN') > -1);
      done();
    });
  });

});
