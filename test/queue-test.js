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
          "id": "1",
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
          "id": "1",
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
          "id": "1",
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
          "id": "1",
          "body": "first message body",
          "timeout": 600
        }
      ],
      "timeout": 600
    })
    .delete(projectPath + '/queues/myqueue/messages/1')
    .reply(200, {
      "msg": "Deleted"
    })
    .get(projectPath + '/queues/myqueue/messages/peek?n=100')
    .reply(200, {
      "messages": [
        {
         "id": '1',
         "body": "first message body",
         "timeout": 600
        },
        {
           "id": '2',
           "body": "second message body",
           "timeout": 600
        }
      ]
    })
    .post(projectPath + '/queues/myqueue/messages/1/touch')
    .reply(200, {
      "msg": "Touched"
    })
    .post(projectPath + '/queues/myqueue/messages/1/touch')
    .reply(200, {
      "msg": "Touched"
    })
    .post(projectPath + '/queues/myqueue/messages/1/release')
    .reply(200, {
      "msg": "Released"
    })
    .post(projectPath + '/queues/myqueue/messages/1/release')
    .reply(200, {
      "msg": "Released"
    })
    .post(projectPath + '/queues/myqueue/subscribers', {
      "subscribers": [
        { "url": "http://example.com/ironmq_push_2" }
      ]
    })
    .reply(200, {
      "id":"50eb546d3264140e8638a7e5",
      "name":"pushq-demo-1",
      "size":7,
      "total_messages":7,
      "project_id":"4fd2729368a0197d1102056b",
      "retries":3,
      "push_type":"multicast",
      "retries_delay":60,
      "subscribers":[
        { "url":"http://example.com/ironmq_push_2" }
      ]
    })
    .post(projectPath + '/queues/myqueue/subscribers', {
      "subscribers": [
        { "url": "http://example.com/ironmq_push_2" },
        { "url": "http://example.com/ironmq_push_3" }
      ]
    })
    .reply(200, {
      "id":"50eb546d3264140e8638a7e5",
      "name":"pushq-demo-1",
      "size":7,
      "total_messages":7,
      "project_id":"4fd2729368a0197d1102056b",
      "retries":3,
      "push_type":"multicast",
      "retries_delay":60,
      "subscribers":[
        { "url":"http://example.com/ironmq_push_2" },
        { "url": "http://example.com/ironmq_push_3" }
      ]
    })
   .delete(projectPath + '/queues/myqueue/subscribers', {
      "subscribers": [
        { "url": "http://example.com/ironmq_push_2" }
      ]
    })
    .reply(200, {
      "id":"50eb546d3264140e8638a7e5",
      "name":"pushq-demo-1",
      "size":7,
      "total_messages":7,
      "project_id":"4fd2729368a0197d1102056b",
      "retries":3,
      "push_type":"multicast",
      "retries_delay":60,
      "subscribers":[
      ]
    })
    .delete(projectPath + '/queues/myqueue/subscribers', {
      "subscribers": [
        { "url": "http://example.com/ironmq_push_2" },
      ]
    })
    .reply(200, {
      "id":"50eb546d3264140e8638a7e5",
      "name":"pushq-demo-1",
      "size":7,
      "total_messages":7,
      "project_id":"4fd2729368a0197d1102056b",
      "retries":3,
      "push_type":"multicast",
      "retries_delay":60,
      "subscribers":[
        { "url": "http://example.com/ironmq_push_3" }
      ]
    })
    .get(projectPath + '/queues/myqueue/messages/1/subscribers')
    .reply(200, {
      "subscribers":[
        {
          "retries_delay":60,
          "retries_remaining":2,
          "status_code":200,
          "status":"deleted",
          "url":"http://mysterious-brook-1807.herokuapp.com/ironmq_push_2",
          "id":"5831237764476661217"
        },
        {
          "retries_delay":60,
          "retries_remaining":2,
          "status_code":200,
          "status":"deleted",
          "url":"http://mysterious-brook-1807.herokuapp.com/ironmq_push_1",
          "id":"5831237764476661218"
        }
      ]
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
        message.id.should.equal('1');
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
      project.queues('myqueue').del('123', function(err, res) {
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
  describe('#msg.touch()', function() {
    // kinky
    it('should touch itself', function(done) {
      project.queues('myqueue').get(function(err, msg) {
        msg.touch(function(err, res) {
          should.not.exist(err);
          res.msg.should.equal('Touched');
          done();
        });
      });
    });
  });
  describe('#msg.release()', function() {
    // kinky
    it('should release itself', function(done) {
      project.queues('myqueue').get(function(err, msg) {
        msg.release(function(err, res) {
          should.not.exist(err);
          res.msg.should.equal('Released');
          done();
        });
      });
    });
  });
  describe('#peek()', function() {
    it('should return next messages in the queue', function(done) {
      project.queues('myqueue').peek(100, function(err, messages) {
        should.not.exist(err);
        messages.length.should.equal(2);
        done();
      });
    });
  });
  describe('#touch', function() {
    it('should touch a message', function(done) {
      project.queues('myqueue').touch('1', function(err, res) {
        res.msg.should.equal('Touched');
        done();
      });
    });
  });
  describe('#release', function() {
    it('should release a message', function(done) {
      project.queues('myqueue').release('1', function(err, res) {
        res.msg.should.equal('Released');
        done();
      });
    });
  });
  describe('#subscribe', function() {
    it('should add a subscriber', function(done) {
      var url = 'http://example.com/ironmq_push_2';
      project.queues('myqueue').subscribe(url, function(err, res) {
        res.subscribers.length.should.equal(1);
        res.subscribers[0].url.should.equal(url);
        done();
      });
    });
    it('should add subscribers', function(done) {
      var urls = [
          'http://example.com/ironmq_push_2'
        , 'http://example.com/ironmq_push_3'
      ];
      project.queues('myqueue').subscribe(urls, function(err, res) {
        res.subscribers.length.should.equal(2);
        res.subscribers[0].url.should.equal(urls[0]);
        res.subscribers[1].url.should.equal(urls[1]);
        done();
      });
    });
  });
  describe('#unsubscribe', function() {
    it('should remove a subscriber', function(done) {
      var url = 'http://example.com/ironmq_push_2';
      project.queues('myqueue').unsubscribe(url, function(err, res) {
        res.subscribers.length.should.equal(0);
        done();
      });
    });
    it('should remove subscribers', function(done) {
      var urls = [
          'http://example.com/ironmq_push_2'
      ];
      project.queues('myqueue').unsubscribe(urls, function(err, res) {
        res.subscribers.length.should.equal(1);
        done();
      });
    });
  });
  describe('#subscribers', function() {
    it('should get message subscribers', function(done) {
      project.queues('myqueue').subscribers('1', function(err, res) {
        res.subscribers.length.should.equal(2);
        done();
      });
    });
  });
});
