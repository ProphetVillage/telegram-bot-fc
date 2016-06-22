
const MongoClient = require('mongodb').MongoClient;

function DB(opts) {
  if (!DB.db) {
    init_db(opts);
  }
}

DB.prototype.collection = function (col) {
  return DB.db.collection(col);
};

DB.prototype.close = function () {
  return DB.db.close();
};

function init_db(opts) {
  var dburl = 'mongodb://' + opts.host;
  if (opts.port) {
    dburl += ':' + opts.port;
  }
  dburl += '/' + opts.database;
  
  MongoClient.connect(dburl, function(err, db) {
    if (err) {
      console.log(err);
      return;
    }
    console.log("Connected to database server.");
    //db.close();
    DB.db = db;
  });
}

module.exports = DB;
