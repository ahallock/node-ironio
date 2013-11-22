function CodePackage(path, api) {
  this.path = path;
  this.api = api;
};

CodePackage.prototype.info = function(fn) {
  this.api.get(this.path, fn);
};

CodePackage.prototype.del = function(fn) {
  this.api.del(this.path, fn);
};

CodePackage.prototype.revisions = function(fn) {
  this.api.get(this.path + '/revisions', fn);
};

CodePackage.prototype.download = function(revision, fn) {
	if (typeof revision === 'function') {
		fn = revision;
		revision = false;
	}

	var downloadPath = this.path + '/download' +
		(revision ? '?revision=' + revision : '');
	this.api.download(downloadPath, fn);	
}

/*!
 * Module exports.
 */
module.exports = CodePackage;
