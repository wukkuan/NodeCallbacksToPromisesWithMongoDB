var MongoClient = require('mongodb').MongoClient
  , format = require('util').format
  , async = require('async');

var db, collection, docs;

async.series([
  function(done) {
    MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, testdb) {
      if(err) return done(err);
      db = testdb;
      collection = db.collection('test_insert');
      done(null, collection);
    });
  },
  function(done) {
    collection.insert({a:2}, function(err, docs) {
      if (err) done(err);
      done(null, docs);
    });
  }],
  function(err) {
    async.parallel([
      function(done) {
        collection.count(function(err, count) {
          if (err) return done(err);
          console.log(format("count = %s", count));
          done();
        });
      },
      function(done) {
        // Locate all the entries using find
        collection.find().toArray(function(err, results) {
          if (err) return done(err);
          console.dir(results);
          done();
        });
      }],
      function(err, results) {
        // Let's close the db
        db.close();
      }
    );
  }
);
