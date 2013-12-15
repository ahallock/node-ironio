var nock = require('nock')
  , should = require('should')
  , fs = require('fs');

var ironio = require('../')('oauth2 token')
  , project = ironio.projects('000000000000000000000000')
  , host = 'https://worker-aws-us-east-1.iron.io';

describe('CodePackage', function() {
  before(function(done) {
    var projectPath = '/2/projects/000000000000000000000000';
    nock(host)
    .get(projectPath + '/codes')
    .reply(200, {
      "codes": [
        {
            "id": "4ea9c05dcddb131f1a000002",
            "project_id": "4ea9c05dcddb131f1a000001",
            "name": "MyWorker",
            "runtime": "ruby",
            "latest_checksum": "b4781a30fc3bd54e16b55d283588055a",
            "rev": 1,
            "latest_history_id": "4f32ecb4f840063758022153",
            "latest_change": 1328737460598000000
        }
      ]
    })
    .get(projectPath + '/codes/123')
    .reply(200, {
      "id": "4eb1b241cddb13606500000b",
      "project_id": "4eb1b240cddb13606500000a",
      "name": "MyWorker",
      "runtime": "ruby",
      "latest_checksum": "a0702e9e9a84b758850d19ddd997cf4a",
      "rev": 1,
      "latest_history_id": "4eb1b241cddb13606500000c",
      "latest_change": 1328737460598000000
    })
    .delete(projectPath + '/codes/123')
    .reply(200, {
      "msg": "Deleted"
    })
    .get(projectPath + '/codes/123/revisions')
    .reply(200, {
      "revisions": [
          {
              "id": "4f32d9c81cf75447be020ea6",
              "code_id": "4f32d9c81cf75447be020ea5",
              "project_id": "4f32d521519cb67829000390",
              "rev": 1,
              "runtime": "ruby",
              "name": "MyWorker",
              "file_name": "worker.rb",
          },
          {
              "id": "4f32da021cf75447be020ea8",
              "code_id": "4f32d9c81cf75447be020ea5",
              "project_id": "4f32d521519cb67829000390",
              "rev": 2,
              "runtime": "ruby",
              "name": "MyWorker",
              "file_name": "worker.rb",
          }
      ]
    })
    .get(projectPath + '/codes/123/download?revision=1')
    .replyWithFile(
        200
      , __dirname + '/fixtures/testworker_1.zip'
      , {'Content-Disposition': 'filename=testworker_1.zip'}
    );
    done();
  });
  after(function(done) {
    nock.cleanAll();
    // remove zip file created in file download
    fs.unlink('./testworker_1.zip', done);
  });
  describe('#codes()', function() {
    it('should return a list of code packages', function(done) {
      project.codePackages.list(function(err, res) {
        should.not.exist(err);
        res.codes.length.should.equal(1);
        res.codes[0].id.should.equal('4ea9c05dcddb131f1a000002');
        res.codes[0].runtime.should.equal('ruby');
        done();
      });
    });
  });
  describe('#info()', function() {
    it('should return info about a code package', function(done) {
      project.codePackages('123').info(function(err, res) {
        should.not.exist(err);
        res.id.should.equal('4eb1b241cddb13606500000b');
        res.runtime.should.equal('ruby');
        done();
      });
    });
  });
  describe('#del()', function() {
    it('should delete a code package', function(done) {
      project.codePackages('123').del(function(err, res) {
        should.not.exist(err);
        res.msg.should.equal('Deleted');
        done();
      });
    });
  });
  describe('#revisions()', function() {
    it('should list code package revisions', function(done) {
      project.codePackages('123').revisions(function(err, res) {
        should.not.exist(err);
        res.revisions.length.should.equal(2);
        res.revisions[0].id.should.equal('4f32d9c81cf75447be020ea6');
        done();
      });
    });
  });
  describe('#download()', function() {
    it('should download the code package', function(done) {
      project.codePackages('123').download(1, function(err, filename) {
        should.not.exist(err);
        filename.should.equal('testworker_1.zip');
        done();
      });
    });
  });
});
