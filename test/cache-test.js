var should = require('should')
  , nock = require('nock')
  ;

var ironio = require('../')('oauth2 token')
  , project = ironio.projects('000000000000000000000000')
  , host = 'https://cache-aws-us-east-1.iron.io'
  ;

describe('Cache', function() {
  before(function(done) {
    var projectPath = '/1/projects/000000000000000000000000';
    nock(host)
    .get(projectPath + '/caches')
    .reply(200, [
      {
        "project_id": "PROJECT ID",
        "name": "CACHE NAME"
      },
      {
        "project_id": "PROJECT ID",
        "name": "CACHE NAME"
      }
    ])
    .get(projectPath + '/caches/mycache')
    .reply(200, {
      "size": 1
    })
    .post(projectPath + '/caches/mycache/clear')
    .reply(200, {
      "msg": "Cleared."
    })
    .put(projectPath + '/caches/mycache/items/key', {
      value: 'value'
    })
    .reply(200, {
      'msg': 'Stored.'
    })
    .post(projectPath + '/caches/mycache/items/key/increment', {
      amount: 1,
    })
    .reply(200, {
      "msg": "Added",
      "value": 11
    })
    .get(projectPath + '/caches/mycache/items/key')
    .reply(200, {
      "cache": "CACHE NAME",
      "key": "ITEM KEY",
      "value": "ITEM VALUE"
    })
    .delete(projectPath + '/caches/mycache/items/key')
    .reply(200, {
      "msg": "Deleted."
    });
    done();
  });
  describe('#list()', function() {
    it('should return a list of caches', function(done) {
      project.caches.list(function(err, caches) {
        should.not.exist(err);
        caches.length.should.equal(2);
        caches[0].name.should.equal('CACHE NAME');
        caches[0].project_id.should.equal('PROJECT ID');
        done();
      }); 
    });
  });
  describe('#info()', function() {
    it('should return cache info', function(done) {
      project.caches('mycache').info(function(err, res) {
        should.not.exist(err);
        res.size.should.equal(1);
        done();
      });
    });
  });
  describe('#clear()', function() {
    it('should clear cache', function(done) {
      project.caches('mycache').clear(function(err, res) {
        should.not.exist(err);
        res.msg.should.equal('Cleared.');;
        done();
      });
    });
  });
  describe('#put()', function() {
    it('should put value at key', function(done) {
      project.caches('mycache').put('key', 'value', function(err, res) {
        should.not.exist(err);
        res.msg.should.equal('Stored.');
        done();
      });
    });
  });
  describe('#incr()', function() {
    it('should increment value at key', function(done) {
      project.caches('mycache').incr('key', 1, function(err, res) {
        should.not.exist(err);
        res.msg.should.equal('Added');
        done();
      });
    });
  });
  describe('#get()', function() {
    it('should get value at key', function(done) {
      project.caches('mycache').get('key', function(err, res) {
        should.not.exist(err);
        res.cache.should.equal('CACHE NAME');
        res.key.should.equal('ITEM KEY');
        res.value.should.equal('ITEM VALUE');
        done();
      });
    });
  });
  describe('#del()', function() {
    it('should delete at key', function(done) {
      project.caches('mycache').del('key', function(err, res) {
        should.not.exist(err);
        res.msg.should.equal('Deleted.');
        done();
      });
    });
  });
});
