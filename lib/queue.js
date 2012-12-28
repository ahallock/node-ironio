/*!
 * Module dependencies.
 */
var join = require('path').join
  , querystring = require('querystring')
  ;

function Queue(path, api) {
  this.path = path;
  this.api = api;
};

Queue.prototype.info = function(fn) {
  this.api.get(this.path, fn);
};

Queue.prototype.destroy = function(fn) {
  this.api.del(this.path, fn);
};

Queue.prototype.clear = function(fn) {
  this.api.post(join(this.path, 'clear'), null, fn);
};

Queue.prototype.post = function(messages, fn) {
  // convenience
  if (typeof messages === 'string') {
    messages = [{ body: messages }];
  } else if (!Array.isArray(messages)) {
    messages = [messages];
  }
  var body = { messages: messages };
  this.api.post(join(this.path, 'messages'), body, fn);
};

Queue.prototype.get = function(params, fn) {
  var msgPath = join(this.path, 'messages');
  if (typeof params === 'function') {
    fn = params;
    params = {};
  } else {
    msgPath += '?' + querystring.stringify(params);
  }
  var self = this;
  this.api.get(msgPath, function(err, body) {
    if (err) return fn(err);
    var messages = body.messages.map(function(message) {
      // convenience
      message.del = function(fn) {
        self.del(this.id, fn);
      };
      return message;
    });
    if (messages.length === 1) return fn(null, messages[0]);
    fn(null, messages);
  });
};

Queue.prototype.del = function(id, fn) {
  this.api.del(join(this.path, 'messages', id.toString()), fn);
};

/*!
 * Module exports.
 */
module.exports = Queue;
