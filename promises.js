var MongoClient = require('mongodb').MongoClient
  , format = require('util').format
  , Q = require('q');

Q.ninvoke(MongoClient, 'connect', 'mongodb://127.0.0.1:27017/test')
  .then(function(db) {
    var collection = db.collection('test_insert');
    return Q.all([
      db,
      collection,
      Q.ninvoke(collection, 'insert', {a:2})
    ]);
  })
  .spread(function(db, collection, docs) {
    Q.ninvoke(collection, 'count')
      .then(function(count) {
        console.log(format("count = %s", count));
      });

    Q.ninvoke(collection.find(), 'toArray')
      .then(function(results) {
        console.dir(results);
        db.close();
      });
  })
  .catch(function(err) {
    console.log('error: ', err);
  });
