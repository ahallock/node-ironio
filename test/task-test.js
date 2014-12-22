var nock = require('nock')
  , should = require('should')
  ;

var ironio = require('../')('oauth2 token')
  , project = ironio.projects('000000000000000000000000')
  , host = 'https://worker-aws-us-east-1.iron.io'
  ;

describe('Task', function() {
  before(function(done) {
    var projectPath = '/2/projects/000000000000000000000000';
    nock(host)
    .get(projectPath + '/tasks')
    .reply(200, {
      "tasks": [
        {
            "id": "4f3595381cf75447be029da5",
            "percent": 100
        }
      ]
    })
    .get(projectPath + '/schedules')
    .reply(200, {
      "schedules": [
        {
          "id": "4eb1b490cddb136065000011",
          "code_name": "MyWorker",
          "run_times": 1,
          "run_count": 1
        }
      ]
    })
    .post(projectPath + '/tasks', {tasks: [{
                                            code_name: 'code name',
                                            payload: 'payload',
                                            priority: 0,
                                            delay: 0,
                                            label: 'test label',
                                            cluster: 'default'
                                          }]
    })
    .reply(200, {
      "msg": "Queued up",
      "tasks": [
        {
            "id": "4eb1b471cddb136065000010"
        }
      ]
    })
    .post(projectPath + '/tasks', {tasks: [{ code_name: 'code name', payload: 'payload' }]})
    .reply(200, {
      "msg": "Queued up",
      "tasks": [
        {
            "id": "4eb1b471cddb136065000010"
        }
      ]
    })
    .post(projectPath + '/schedules', {
      schedules: [{
      payload : "payload",
      name: "MyScheduledTask",
      code_name: "MyWorker",
      run_every: 3600
    }]})
    .reply(200, {
      "msg": "Scheduled",
      "schedules": [
        {
            "id": "4eb1b490cddb136065000011"
        }
      ]
    })
    .post(projectPath + '/schedules', {
      schedules: [{
      payload : "payload",
      name: "MyScheduledTask",
      code_name: "MyWorker",
      run_every: 3600
    }]})
    .reply(200, {
      "msg": "Scheduled",
      "schedules": [
        {
            "id": "4eb1b490cddb136065000011"
        }
      ]
    })
    .post(projectPath + '/tasks/webhook?code_name=code_name', {})
    .reply(200,{
      "id": "4f3595381cf75447be029da5",
      "msg":"Queued up."
    })
    .get(projectPath + '/tasks/1')
    .reply(200, {
      "id": "4eb1b471cddb136065000010",
      "status": "complete",
      "code_name": "MyWorker"
    })
    .get(projectPath + '/tasks/1/log')
    .reply(200, 'log')
    .post(projectPath + '/tasks/1/cancel')
    .reply(200, {
      "msg": "Cancelled"
    })
    .post(projectPath + '/tasks/1/progress', {
      "percent": 25,
      "msg": "msg"
    })
    .reply(200, {
      "msg": "Progress set"
    })
    .post(projectPath + '/tasks/1/retry', {
      "delay": 0
    })
    .reply(200, {
      "msg": "Queued up",
      "tasks": [
        {
          "id": "4eb1b471cddb136065000010"
        }
      ]
    })
    .get(projectPath + '/schedules/1')
    .reply(200, {
      "id": "4eb1b490cddb136065000011",
      "msg": "Ran max times.",
      "status": "complete"
    })
    .post(projectPath + '/schedules/1/cancel')
    .reply(200, {
      "msg": "Cancelled"
    });
    done();
  });
  after(function(done) {
    nock.cleanAll();
    done();
  });
  describe('#list()', function() {
    it('should return a list of tasks', function(done) {
      project.tasks.list(function(err, res) {
        should.not.exist(err);
        res.tasks.length.should.equal(1);
        res.tasks[0].id.should.equal('4f3595381cf75447be029da5');
        res.tasks[0].percent.should.equal(100);
        done();
      });
    });
  });
  describe('#scheduled.list()', function() {
    it('should return a list of scheduled tasks', function(done) {
      project.tasks.scheduled.list(function(err, res) {
        should.not.exist(err);
        res.schedules.length.should.equal(1);
        res.schedules[0].id.should.equal('4eb1b490cddb136065000011');
        res.schedules[0].code_name.should.equal('MyWorker');
        res.schedules[0].run_times.should.equal(1);
        res.schedules[0].run_count.should.equal(1);
        done();
      });
    });
  });
  describe('#queue()', function() {
    it('should queue a task', function(done) {
      var body = {
        code_name: 'code name',
        payload: 'payload',
        priority: 0,
        delay: 0,
        label: 'test label',
        cluster: 'default'
      };
      project.tasks.queue(body, function(err, res) {
        should.not.exist(err);
        res.msg.should.equal('Queued up');
        res.tasks.length.should.equal(1);
        res.tasks[0].id.should.equal('4eb1b471cddb136065000010');
        done();
      });
    });
    it('should queue an array of tasks', function(done) {
      var body = [{ code_name: 'code name', payload: 'payload' }];
      project.tasks.queue(body, function(err, res) {
        should.not.exist(err);
        res.msg.should.equal('Queued up');
        res.tasks.length.should.equal(1);
        res.tasks[0].id.should.equal('4eb1b471cddb136065000010');
        done();
      });
    });
  });
  describe('#schedule()', function() {
    it('should schedule a task', function(done) {
      var body = {
        payload : "payload",
        name: "MyScheduledTask",
        code_name: "MyWorker",
        run_every: 3600
      };
      project.tasks.schedule(body, function(err, res) {
        should.not.exist(err);
        res.msg.should.equal('Scheduled');
        res.schedules.length.should.equal(1);
        res.schedules[0].id.should.equal('4eb1b490cddb136065000011');
        done();
      });
    });
    it('should schedule an array of tasks', function(done) {
      var body = [{
        payload : "payload",
        name: "MyScheduledTask",
        code_name: "MyWorker",
        run_every: 3600
      }];
      project.tasks.schedule(body, function(err, res) {
        should.not.exist(err);
        res.msg.should.equal('Scheduled');
        res.schedules.length.should.equal(1);
        res.schedules[0].id.should.equal('4eb1b490cddb136065000011');
        done();
      });
    });
  });
  describe('#webhook()', function() {
    it('should create a web hook task', function(done) {
      project.tasks.webhook('code_name', {}, function(err, res) {
        should.not.exist(err);
        res.id.should.equal('4f3595381cf75447be029da5');
        res.msg.should.equal('Queued up.');
        done();
      });
    });
  });
  describe('#info()', function() {
    it('should get info about a task', function(done) {
      project.tasks.info('1', function(err, res) {
        should.not.exist(err);
        res.id.should.equal('4eb1b471cddb136065000010');
        res.status.should.equal('complete');
        res.code_name.should.equal('MyWorker');
        done();
      });
    });
  });
  describe('#log()', function() {
    it('should get info about a task', function(done) {
      project.tasks.log('1', function(err, res) {
        should.not.exist(err);
        res.should.equal('log');
        done();
      });
    });
  });
  describe('#cancel()', function() {
    it('should cancel a task', function(done) {
      project.tasks.cancel('1', function(err, res) {
        should.not.exist(err);
        res.msg.should.equal('Cancelled');
        done();
      });
    });
  });
  describe('#progress()', function() {
    it('should update the task\'s progress', function(done) {
      project.tasks.progress('1', 25, 'msg', function(err, res) {
        should.not.exist(err);
        res.msg.should.equal('Progress set');
        done();
      });
    });
  });
  describe('#retry()', function() {
    it('should retry a task', function(done) {
      project.tasks.retry('1', function(err, res) {
        should.not.exist(err);
        res.msg.should.equal('Queued up');
        res.tasks.length.should.equal(1);
        res.tasks[0].id.should.equal('4eb1b471cddb136065000010');
        done();
      });
    });
  });
  describe('#scheduled.info()', function() {
    it('should get info about a scheduled task', function(done) {
      project.tasks.scheduled.info('1', function(err, res) {
        should.not.exist(err);
        res.id.should.equal('4eb1b490cddb136065000011');
        res.msg.should.equal('Ran max times.');
        res.status.should.equal('complete');
        done();
      });
    });
  });
  describe('#scheduled.cancel()', function() {
    it('should cancel a scheduled task', function(done) {
      project.tasks.scheduled.cancel('1', function(err, res) {
        should.not.exist(err);
        res.msg.should.equal('Cancelled');
        done();
      });
    });
  });
});

