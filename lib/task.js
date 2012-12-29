/*!
 * Module dependencies.
 */
var join = require('path').join;

function task(path, api) {
  var taskPath = path;
  var schedulePath = path.replace('task', 'schedule');

  function queue(taskList, fn) {
    if (Array.isArray(taskList)) {
      taskList = { tasks: taskList };  
    } else {
      taskList = { tasks: [taskList] };
    }
    api.post(taskPath, taskList, fn);
  }

  function schedule(schedules, fn) {
    if (Array.isArray(schedules)) {
      schedules = { schedules: schedules };  
    } else {
      schedules = { schedules: [schedules] };
    }
    api.post(schedulePath, schedules, fn); 
  }

  function webhook(codename, body, fn) {
    var hookPath = join(taskPath, 'webhook') + '?code_name=' + codename;
    api.post(hookPath, body, fn);  
  }

  function info(id, fn) {
    api.get(join(taskPath, id), fn);
  }
  
  function log(id, fn) {
    api.get(join(taskPath, id, 'log'), fn);
  }
  
  function cancel(id, fn) {
    api.post(join(taskPath, id, 'cancel'), null, fn);
  }

  function progress(id, percent, msg, fn) {
    var body = {
        percent: percent
      , msg: msg
    };
    api.post(join(taskPath, id, 'progress'), body, fn);
  }
  
  function retry(id, delay, fn) {
    if (typeof delay === 'function') {
      fn = delay;
      delay = 0;
    }
    var body = { delay: delay };
    api.post(join(taskPath, id, 'retry'), body, fn);
  }
  
  function scheduleInfo(id, fn) {
    api.get(join(schedulePath, id), fn);
  }

  function cancelSchedule(id, fn) {
    api.post(join(schedulePath, id, 'cancel'), null, fn);
  }

  return {
      queue: queue
    , schedule: schedule
    , webhook: webhook
    , info: info
    , log: log
    , cancel: cancel
    , progress: progress
    , retry: retry
    , scheduled: {
          info: scheduleInfo
        , cancel: cancelSchedule
      }
  };
}


/*!
 * Module exports.
 */
module.exports = task;
