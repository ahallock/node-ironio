/*!
 * Module dependencies.
 */

function Cache(path, api) {
  this.path = path;
  this.api = api;
};

Cache.prototype.info = function(fn) {
  this.api.get(this.path, fn);
};

Cache.prototype.destroy = function(fn) {
  this.api.del(this.path, fn);
};

Cache.prototype.clear = function(fn) {
  this.api.post(this.path + '/clear', null, fn);
};

Cache.prototype.put = function(key, value, fn) {
  if (typeof value === 'string') {
    value = { value: value };
  }
  this.api.put(this.path + '/items/' + key, value, fn);
};

Cache.prototype.incr = function(key, amount, fn) {
  var body = { amount: amount };
  this.api.post(this.path + '/items/' + key + '/increment', body, fn);
};

Cache.prototype.get = function(key, fn) {
  this.api.get(this.path + '/items/'+ key, function(err, res) {
    if (err) {
      // this doesn't seem elegant, but a non-existent key
      // is not an error for a lot of cases (key expired, deleted, etc.)
      if (err.message === 'Response code: 404') {
        return fn();
      }
      return fn(err);
    }
    fn(null, res.value);
  });
};

Cache.prototype.del = function(key, fn) {
  this.api.del(this.path + '/items/' + key, fn);
};

/*!
 * Module exports.
 */
module.exports = Cache;
