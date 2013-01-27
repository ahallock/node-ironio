/*!
 * Module dependencies.
 */
var request = require('request')
  , path = require('path')
  ;

/**
 * @constant
 */
var CLOUDS = {
  aws: {
      cache: 'cache-aws-us-east-1'
    , queue: 'mq-aws-us-east-1'
    , worker: 'worker-aws-us-east-1'
  },
  rackspace: {
    queue: 'mq-rackspace-dfw'
  }
};

/**
 * Creates the API object. 
 *
 * @param {String} token OAuth2 token
 * @param {Object} [options] 
 * @return {Object} api
 */
function api(token, options) {
  options = options || {};
  var cloud = options.cloud || 'aws';
 
  function exec(endpoint, method, body, fn) {
    var service = 'queue';
    if (/projects\/\w{24}\/caches/.test(endpoint)) {
      service = 'cache';
    } else if (/projects\/\w{24}\/(codes|tasks|schedules)/.test(endpoint)) {
      service = 'worker';
    }
    var subdomain = CLOUDS[cloud][service];
    var version = service === 'worker' ? '2' : '1';
    var url = 'https://' + subdomain + '.iron.io/' + 
      path.join(version, endpoint);
      
    var requestOptions = {
        url: url 
      , json: true
      , method: method
      , headers: {
          Authorization: 'OAuth ' + token      
        }
    };
  
    if (body) requestOptions.body = body;

    request(requestOptions, function(err, res, body) {
      if (err) return fn(err);
      if (res.statusCode !== 200) {
        return fn(new Error('Response code ' + 
          res.statusCode + ': ' + JSON.stringify(body)));
      }
      fn(null, body);
    });
  }
  
  function get(endpoint, fn) {
    exec(endpoint, 'GET', null, fn);
  }

  function post(endpoint, body, fn) {
    exec(endpoint, 'POST', body, fn);
  }
  
  function put(endpoint, body, fn) {
    exec(endpoint, 'PUT', body, fn);
  }

  function del(endpoint, body, fn) {
    if (typeof body === 'function') {
      fn = body;
      body = null;
    }
    exec(endpoint, 'DELETE', body, fn);
  }

  return {
      get: get
    , post: post
    , put: put
    , del: del
  };
}

/*!
 * Module exports.
 */
module.exports = api;
