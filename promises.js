var MongoClient = require('mongodb').MongoClient
  , format = require('util').format
  , Q = require('q');

// ninvoke wraps a method that uses a node-style callback in a promise.
Q.ninvoke(MongoClient, 'connect', 'mongodb://127.0.0.1:27017/test')
  .then(function(db) {
    var collection = db.collection('test_insert');
    // We need to execute `collection.insert({a:2})` and have the callback
    // wrapped in a promise. However, there is a caveat this time.
    //
    // Because we'll need the db and collection values in async calls that
    // happen after this one, we need a way to pass these values on to the
    // next promise. `Q.all` is my preferred way of doing this.
    //
    // `Q.all` takes an array of values and promises and returns a promise that
    // will be fulfilled when all promises in the array are fulfilled. The
    // value fulfilled will be the array containing all of the values and the
    // fulfilled values of the promises. The order of the return value will not
    // change.
    return Q.all([
      db,
      collection,
      Q.ninvoke(collection, 'insert', {a:2})
    ]);
  })
  // After the value has been inserted into Mongo, this promise will be
  // fulfilled. We'll take the values array and pull out the values we need to
  // continue.
  //
  // This is the equivalent of
  // `.then(function(values) { var db=values[0], ...`.
  .spread(function(db, collection, docs) {
    // The two async methods called here are pretty straightforward. Making
    // these promises doesn't simplify the code, but it does keep it
    // consistent. I'd probably just leave the callbacks in normal practice.

    Q.ninvoke(collection, 'count')
      .then(function(count) {
        console.log(format("count = %s", count));
      });

    // Locate all the entries using find
    Q.ninvoke(collection.find(), 'toArray')
      .then(function(results) {
        console.dir(results);
        // Let's close the db
        db.close();
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
