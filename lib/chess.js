'use strict'

const _ = require('underscore');

/* Model:
    chat_id: 
    chessboard: 
    players: [ { name: , user_id: , chessman: } ]
    current: 
*/

// 0: havent takeoff

function Chess(db) {
  this.collection = db.collection('chess_session');
}

/* 
  data: {
    players: 2,
    chat_id: [chat_id],
    red: {
      
    },
    blue: {
    
    }
  }
*/
Chess.prototype.start = function (data) {
  
};

Chess.prototype.new = function (chat_id) {
  this.chessboard = {
    red: [0, 0, 0, 0],
    blue: [0, 0, 0, 0],
    green: [0, 0, 0, 0],
    yellow: [0, 0, 0, 0],
  };
  this.playerlist = [];
  this.current = 0;
  this.chat_id = chat_id;
};

Chess.prototype.continue = function (session) {
  this._id = session._id;
  this.chessboard = session.chessboard;
  this.playerlist = session.playerlist;
  this.current = session.current;
  this.chat_id = session.chat_id;
};

Chess.prototype.join = function (user_id, name) {
  if (this.playerlist.length < 4) {
    var chessmen = ['red', 'blue', 'green', 'yellow'];
    var i = this.playerlist.length;
    var player = {
      name: name,
      user_id: user_id,
      chessman: chessmen[i]
    };
    this.playerlist.push(player);
    return chessmen[i];
  } else {
    return false;
  }
};

Chess.prototype.currentPlayer = function () {
};

Chess.prototype.load = function (chat_id, cb) {
  // load from database
  var self = this;
  this.collection.findOne({'chat_id': chat_id}, function (err, item) {
    if (err) {
      return cb(err);
    }
    if (!item) {
      self.new(chat_id);
    } else {
      self.continue(item);
    }
    cb(null);
  });
};

Chess.prototype.next = function (num) {
};

Chess.prototype.takeoff = function () {
};

Chess.prototype.save = function (cb) {
  // save to database
  var session = {
    chessboard: this.chessboard,
    playerlist: this.playerlist,
    current: this.current,
    chat_id: this.chat_id,
  };
  if (this._id) {
    this.collection.update({ _id: this._id }, {
      $set: session
    }, cb);
  } else {
    var self = this;
    this.collection.save(session, (err, r) => {
      if (err) {
        return cb(err);
      }
      if (r.result && r.result.ok) {
        // update current _id
        self._id = r.ops[0]._id;
      }
      cb(err, r);
    });
  }
};

Chess.prototype.end = function (cb) {
  this.collection.remove({ _id: this._id }, { single: true }, cb);
};

Chess.prototype.endAll = function (cb) {
  this.collection.remove({}, cb);
};

module.exports = Chess;
