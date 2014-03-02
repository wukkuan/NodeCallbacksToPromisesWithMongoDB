var MongoClient = require('mongodb').MongoClient
  , format = require('util').format
  , Q = require('q');

// ninvoke wraps a method that uses a node-style callback in a promise.
Q.ninvoke(MongoClient, 'connect', 'mongodb://127.0.0.1:27017/test')
  .then(function(db) {
    var collection = db.collection('test_insert');
    collection.insert({a:2}, function(err, docs) {

      collection.count(function(err, count) {
        console.log(format("count = %s", count));
      });

      // Locate all the entries using find
      collection.find().toArray(function(err, results) {
        console.dir(results);
        // Let's close the db
        db.close();
      });
    });
  })
  // This will catch any error that occurs inside of this promise. Because
  // Promises/A+ errors bubble, any error occuring inside of this promise
  // that is not caught inside will bubble up to this error handler. For this
  // example, this will be the only error handler we need.
  //
  // Using a separate error handling `then` instead of simply adding the error
  // handler to the outer `then` is important because a separate `then` will
  // also catch any errors that happen in the body of the previous `then`.
  //
  // Equivalent to using `.then(null, function(err) {...})`.
  .catch(function(err) {
    console.log('error: ', err);
  });
