/*!
 * Module dependencies.
 */
var querystring = require('querystring');

function Queue(path, api) {
  this.path = path;
  this.api = api;
};

Queue.prototype.info = function(fn) {
  this.api.get(this.path, fn);
};

Queue.prototype.update = function(body, fn) {
  this.api.post(this.path, body, fn);
};

Queue.prototype.destroy = function(fn) {
  this.api.del(this.path, fn);
};

Queue.prototype.clear = function(fn) {
  this.api.post(this.path + '/clear', null, fn);
};

Queue.prototype.post = function(messages, fn) {
  // convenience
  if (typeof messages === 'string') {
    messages = [{ body: messages }];
  } else if (!Array.isArray(messages)) {
    messages = [messages];
  }
  var body = { messages: messages };
  this.api.post(this.path + '/messages', body, fn);
};

Queue.prototype.get = function(params, fn) {
  var msgPath = this.path +  '/messages';

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
        self.del(this.id, fn || noop);
      };
      message.touch = function(fn) {
        self.touch(this.id, fn || noop);
      };
      message.release = function(fn) {
        self.release(this.id, fn || noop);
      };
      return message;
    });

    if (typeof params.n === 'undefined'
      || params.n === 1) {
      return fn(null, messages[0]);
    }
    fn(null, messages);
  });
};

Queue.prototype.del = function(id, fn) {
  this.api.del(this.path + '/messages/' + id, fn);
};

Queue.prototype.peek = function(n, fn) {
  var peekPath = this.path + '/messages/peek';

  if (typeof n === 'function') {
    fn = n;
    n = 1;
  }
  peekPath += '?n=' + n;
  this.api.get(peekPath, function(err, body) {
    if (err) return fn(err);
    if (n === 1) {
      return fn(null, body.messages[0]);
    }
    fn(null, body.messages);
  });
};

Queue.prototype.touch = function(id, fn) {
  this.api.post(this.path + '/messages/' + id + '/touch', {}, fn);
};

Queue.prototype.release = function(id, delay, fn) {
  if (typeof delay === 'function') {
    fn = delay;
    delay = 0;
  }
  var body = { delay: delay };
  this.api.post(this.path + '/messages/' + id + '/release', body, fn);
};

// push queue endpoints
Queue.prototype.subscribe = function(subscribers, fn) {
  var subscribePath = this.path + '/subscribers';
  if (Array.isArray(subscribers)) {
    subscribers = subscribers.map(function(s) {
      return { url: s };
    });
    subscribers = { subscribers: subscribers };
  } else if (typeof subscribers === 'string') {
    subscribers = { subscribers: [{ url: subscribers }] };
  }
  this.api.post(subscribePath, subscribers, fn);
};

Queue.prototype.unsubscribe = function(subscribers, fn) {
  var subscribePath = this.path + '/subscribers';
  if (Array.isArray(subscribers)) {
    subscribers = subscribers.map(function(s) {
      return { url: s };
    });
    subscribers = { subscribers: subscribers };
  } else if (typeof subscribers === 'string') {
    subscribers = { subscribers: [{ url: subscribers }] };
  }
  this.api.del(subscribePath, subscribers, fn);
};

Queue.prototype.subscribers = function(messageId, fn) {
  var msgPath = this.path + '/messages/' + messageId + '/subscribers';
  this.api.get(msgPath, fn);
};

// helpers
function noop() {}

/*!
 * Module exports.
 */
module.exports = Queue;
