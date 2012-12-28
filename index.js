/*!
 * Module dependencies.
 */
var Cache = require('./lib/cache')
  , Queue = require('./lib/queue')
  , task = require('./lib/task')
  , join = require('path').join
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
    var projectPath = join(path, id);

    function createListFn(name) {
      return function(params, fn) {
        if (typeof params === 'function') {
          fn = params;
          params = null;
        }
        
        var servicePath = join(projectPath, name) +
          (params ? '?' + querystring.stringify(params) : '');
         
        api.get(servicePath, fn);
      };
    }

    function createService(type) {
      var name = type.name.toLowerCase() + 's';
      function service(id) {
        return new type(join(projectPath, name, id), api);
      }
      service.list = createListFn(name);
      return service;
    }

    // 'tasks' needs some specialization
    // to make the API nicer
    var tasks = task(join(projectPath, 'tasks'), api);
    tasks.list = createListFn('tasks');
    tasks.scheduled.list = createListFn('schedules');

    return {
        caches: createService(Cache)
      , queues: createService(Queue)
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
