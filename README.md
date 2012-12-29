# node-ironio 

node-ironio is a Node.js client for IronMQ, IronWorker, and IronCache. See http://www.iron.io
for more details. node-ironio is inspired by seebees' ironmq module: https://github.com/seebees/ironmq 

## Install
    npm install node-ironio

## Examples
```javascript
var ironio = require('ironio')('OAuth token')
  , project = ironio.projects('Project ID');

// IronMq
var q = project.queues('myqueue');

// Get a message
q.get(function(err, message) {
  // do something with the message
  // then delete it
  message.del(function(err) {

  });
});

// Enqueue a message
q.post('message', function(err, res) {

});

// IronCache
var c = project.caches('mycache');

// Add an item to the cache
c.put('key', 'value', function(err) {

});

// Get an item from the cache
c.get('key', function(err, res) {

});

// IronWorker

// Enqueue a task
project.tasks.queue({ code_name: 'myworker', payload: 'payload' }, function(err, res) {

});
```
See the test directory for more examples. 

## Future Work
* IronWorker code package endpoints
* CI for uploading IronWorker modules
* Better configuration handling 
* More documentation and examples
