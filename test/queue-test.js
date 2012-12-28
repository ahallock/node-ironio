var nock = require('nock')
  , should = require('should')
  ;

var ironio = require('../')('oauth2 token')
  , project = ironio.projects('000000000000000000000000')
  , host = 'https://mq-aws-us-east-1.iron.io'
  ;

describe('Queue', function() {
  before(function(done) {
    var messages = {"messages":[{"body":"This is my message 1."},{"body":"This is my message 2.","timeout":30,"delay":2,"expires_in":86400}]};
    var stringMessage = {"messages":[{"body":"This is the message"}]};
    var objectMessage = {"messages": [{ 
          body: 'This is the message.'
        , timeout: 30
        , delay: 2
        , expires_in: 86400
      }]};

    var projectPath = '/1/projects/000000000000000000000000';
    nock(host)
    .get(projectPath + '/queues?page=0&per_page=100')
    .reply(200, [
      {
        "id": "1234567890abcdef12345678",
        "project_id": "1234567890abcdef12345678",
        "name": "queue name"
      }
    ])
    .get(projectPath + '/queues/myqueue')
    .reply(200, {
      "size": "10"
    })
    .delete(projectPath + '/queues/myqueue')
    .reply(200, {
      "msg": "Deleted"
    })
    .post(projectPath + '/queues/myqueue/clear')
    .reply(200, {
      "msg": "Cleared"
    })
    .post(projectPath + '/queues/myqueue/messages', messages)
    .reply(200, {
        "ids": ["message 1 ID", "message 2 ID"],
        "msg": "Messages put on queue."
    })
    .post(projectPath + '/queues/myqueue/messages', stringMessage)
    .reply(200, {
      "ids": ["message 1 ID"],
      "msg": "Messages put on queue."
    })
    .post(projectPath + '/queues/myqueue/messages', objectMessage)
    .reply(200, {
      "ids": ["message 1 ID"],
      "msg": "Messages put on queue."
    })
    .delete(projectPath + '/queues/myqueue/messages/123')
    .reply(200, {
      "msg": "Deleted"
    })
    .get(projectPath + '/queues/myqueue/messages')
    .reply(200, {
      "messages": [
        {
          "id": 1,
          "body": "first message body",
          "timeout": 600
        }
      ],
      "timeout": 600
    })
    .get(projectPath + '/queues/myqueue/messages')
    .reply(200, {
      "messages": [
        {
          "id": 1,
          "body": "first message body",
          "timeout": 600
        }
      ],
      "timeout": 600
    })
    .delete(projectPath + '/queues/myqueue/messages/1')
    .reply(200, {
      "msg": "Deleted"
    });
    done();
  });
  after(function(done) {
    nock.cleanAll();
    done();
  });
  describe('#list()', function() {
    it('should return a list of queues', function(done) {
      project.queues.list({ page: 0, per_page: 100 }, function(err, queues) {
        should.not.exist(err);
        queues[0].id.should.equal('1234567890abcdef12345678');
        queues[0].project_id.should.equal('1234567890abcdef12345678');
        queues[0].name.should.equal('queue name');
        done();
      });
    });
  });
  describe('#info()', function() {
    it('should return queue info', function(done) {
      project.queues('myqueue').info(function(err, info) {
        should.not.exist(err);
        info.size.should.equal("10");
        done(); 
      });
    });
  });
  describe('#destroy()', function() {
    it('should delete a queue', function(done) {
      project.queues('myqueue').destroy(function(err, res) {
        should.not.exist(err);
        res.msg.should.equal('Deleted');
        done();
      });
    });
  });
  describe('#clear()', function() {
    it('should clear the queue', function(done) {
      project.queues('myqueue').clear(function(err, res) {
        should.not.exist(err);
        res.msg.should.equal('Cleared');
        done();
      });
    });
  });
  describe('#get()', function() {
    it('should return a message', function(done) {
      project.queues('myqueue').get(function(err, message) {
        should.not.exist(err);
        message.id.should.equal(1);
        message.body.should.equal('first message body');
        message.timeout.should.equal(600);
        done();
      });
    });
  });
  describe('#post()', function() {
    it('should add array of messages', function(done) {
      var messages = [
        {
          "body": "This is my message 1."
        },
        {
          "body": "This is my message 2.",
          "timeout": 30,
          "delay": 2,
          "expires_in": 86400
        }
      ];
      project.queues('myqueue').post(messages, function(err, res) {
        should.not.exist(err);
        res.ids.length.should.equal(2);
        res.msg.should.equal('Messages put on queue.');
        done(); 
      });
    });
    it('should add string message', function(done) {
      var message = 'This is the message'; 
      project.queues('myqueue').post(message, function(err, res) {
        should.not.exist(err);
        res.ids.length.should.equal(1);
        res.msg.should.equal('Messages put on queue.');
        done(); 
      });
    });
    it('should add object message', function(done) {
      var message = { 
          body: 'This is the message.'
        , timeout: 30
        , delay: 2
        , expires_in: 86400
      }; 
      project.queues('myqueue').post(message, function(err, res) {
        should.not.exist(err);
        res.ids.length.should.equal(1);
        res.msg.should.equal('Messages put on queue.');
        done(); 
      });
    });
  });
  describe('#del()', function() {
    it('should delete a message', function(done) {
      project.queues('myqueue').del(123, function(err, res) {
        should.not.exist(err);
        res.msg.should.equal('Deleted');
        done();
      });
    });
  });
  describe('#msg.del()', function() {
    it('should delete itself', function(done) {
      project.queues('myqueue').get(function(err, msg) {
        msg.del(function(err, res) {
          should.not.exist(err);
          res.msg.should.equal('Deleted');
          done();
        });
      });
    });
  });
});
