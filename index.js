/*!
 * Module dependencies.
 */
var Cache = require('./lib/cache')
	, Queue = require('./lib/queue')
	, task = require('./lib/task')
	, CodePackage = require('./lib/code-package')
	, querystring = require('querystring')
	;

/**
 * Returns the projects function. 
 *
 * @param {String} token OAuth2 token
 * @param {Object} [options] 
 * @return {Function} projects
 * @api public
 */
function ironio(token, options) {
	var api = require('./lib/api')(token, options);
	var path = 'projects';

	function projects(id) {
		var projectPath = path + '/' +	id;

		function createListFn(name) {
			return function(params, fn) {
				if (typeof params === 'function') {
					fn = params;
					params = null;
				}
				
				var servicePath = projectPath + '/' + name +
					(params ? '?' + querystring.stringify(params) : '');
				 
				api.get(servicePath, fn);
			};
		}

		function createService(type, endpointNamespace) {
			function service(id) {
				return new type(projectPath + '/' + endpointNamespace + '/' + id, api);
			}
			service.list = createListFn(endpointNamespace);
			return service;
		}

		// `tasks` needs some specialization to make the API nicer
		var tasks = task(projectPath + '/' + 'tasks', api);
		tasks.list = createListFn('tasks');
		tasks.scheduled.list = createListFn('schedules');

		return {
				caches: createService(Cache, 'caches')
			, queues: createService(Queue, 'queues')
			, codePackages: createService(CodePackage, 'codes')
			, tasks: tasks
		};
	}

	return {
		projects: projects
	};
}

/*!
 * Module exports.
 */
module.exports = ironio;
