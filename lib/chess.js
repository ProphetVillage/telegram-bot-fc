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

Chess.chessmen = ['red', 'blue', 'green', 'yellow'];
Chess.hit_chessman = {
  'red': 'yellow',
  'blue': 'green',
  'yellow': 'red',
  'green': 'blue',
};
Chess.pos_offset = {
  'red': { 'blue': -13, 'yellow': -26, 'green': -39 },
  'blue': { 'yellow': -13, 'green': -26, 'red': -39 },
  'yellow': { 'green': -13, 'red': -26, 'blue': -39 },
  'green': { 'red': -13, 'blue': -26, 'yellow': -39 },
};

Chess.isWin = function (chesses) {
  for (var a of chesses) {
    if (a !== 57) {
      return false;
    }
  }
  return true;
};

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
Chess.prototype.start = function () {
  if (this.playerlist.length >= 2) {
    this.status = 'playing';
    return true;
  }
  return false;
};

Chess.prototype.new = function (chat_id) {
  this.chessboard = {
    /*red: [0, 0, 0, 0],
    blue: [0, 0, 0, 0],
    green: [0, 0, 0, 0],
    yellow: [0, 0, 0, 0],*/
  };
  this.playerlist = [];
  this.winners = [];
  this.current = 0;
  this.chat_id = chat_id;
  this.status = 'waiting';
};

Chess.prototype.continue = function (session) {
  this._id = session._id;
  this.chessboard = session.chessboard;
  this.playerlist = session.playerlist;
  this.winners = session.winners;
  this.current = session.current;
  this.chat_id = session.chat_id;
  this.status = session.status;
};

Chess.prototype.join = function (user_id, name) {
  if (this.status !== 'waiting') {
    return false;
  }
  if (this.playerlist.length < 4) {
    var chessmen = Chess.chessmen;
    var i = this.playerlist.length;
    var player = {
      name: name,
      user_id: user_id,
      chessman: chessmen[i]
    };
    this.chessboard[chessmen[i]] = [0, 0, 0, 0];
    this.playerlist.push(player);
    return chessmen[i];
  } else {
    return false;
  }
};

Chess.prototype.currentPlayer = function () {
  if (this.playerlist.length) {
    return this.playerlist[this.current];
  }
  return null;
};

Chess.prototype.checkWin = function () {
  var p = this.currentPlayer();
  if (p && Chess.isWin(this.chessboard[p.chessman])) {
    this.winners.push(this.current);
    return true;
  }
  return false;
};

Chess.prototype.isEnded = function () {
  return (this.winners.length >= this.playerlist.length - 1);
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

Chess.prototype.groupTo = function (chess, pos) {
  var p = this.currentPlayer();
  var d = this.chessboard[p.chessman];
  
  // list and set
  for (var i = 0; i < 4; i++) {
    if (i !== chess && d[i] === d[chess]) {
      d[i] = pos;
    }
  }
  
  // set last
  d[chess] = pos;
};

// return true means current player moved
Chess.prototype.next = function (chess, num) {
  var p = this.currentPlayer();
  var d = this.chessboard[p.chessman];
  if (!d[chess]) {
    // can't move it
    return false;
  }
  if (d[chess] === 57) {
    // won
    return false;
  }
  this.groupTo(chess, d[chess] + num);
  if (d[chess] === 57) {
    // won
    return true;
  } else if (d[chess] > 57) {
    this.groupTo(chess, 57 - (d[chess] - 57));
  }
  return true;
};

Chess.prototype.takeoff = function () {
  var p = this.currentPlayer();
  var d = this.chessboard[p.chessman];
  for (var i = 0; i < 4; i++) {
    if (d[i] === 0) {
      d[i] = 1;
      return true;
    }
  }
  return false;
};

Chess.prototype.save = function (cb) {
  // save to database
  var session = {
    chessboard: this.chessboard,
    playerlist: this.playerlist,
    winners: this.winners,
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

Chess.prototype.applyRules = function (choice) {
  var r = {};
  var gohome = function (chessman, i) {
    if (!r.gohome) {
      r.gohome = {};
      r.gohome[chessman] = [ i ];
    } else {
      r.gohome[chessman].push(i);
    }
  };
  var p = this.currentPlayer();
  var chesspos = this.chessboard[p.chessman][choice];
  
  if (!chesspos) {
    // unknow error
    return;
  }
  
  // check hit
  if (chesspos === 19) {
    var nextman = Chess.hit_chessman[p.chessman];
    var chesses = this.chessboard[nextman];
    for (var i = 0; i < 4; i++) {
      if (chesses[i] === 54) {
        // hit back
        gohome(nextman, i);
        chesses[i] = 0;
      }
    }
  }
  
  // check jump
  if (chesspos === 19) {
    this.groupTo(choice, 31);
    chesspos = 31;
    r.jumped = true;
  } else if (chesspos < 51 && (chesspos - 3) % 4 === 0) {
    this.groupTo(choice, chesspos + 4);
    chesspos += 4;
    r.jumped = true;
  }
  
  // check collision
  for (var man in this.chessboard) {
    if (man !== p.chessman) {
      var chesses = this.chessboard[man];
      var offset = Chess.pos_offset[p.chessman][man];
      for (var i = 0; i < 4; i++) {
        if (chesses[i] > 1 && chesspos + offset === chesses[i]) {
          // colli back
          gohome(man, i);
          chesses[i] = 0;
        }
      }
    }
  }
  
  if (r.jumped || r.gohome) {
    return r;
  } else {
    return false;
  }
};

// update current
Chess.prototype.moveNext = function () {
  if (this.winners.length >= this.playerlist.length - 1) {
    // no need to move next player
    return false;
  }
  var i = 0;
  while (i < 4) {
    this.current++;
    if (this.current >= this.playerlist.length) {
      this.current = 0;
    }
    if (this.winners.indexOf(this.current) < 0) {
      return true;
    }
    i++;
  }
  return false;
};

Chess.prototype.end = function (cb) {
  this.collection.remove({ _id: this._id }, { single: true }, cb);
};

Chess.prototype.endAll = function (cb) {
  this.collection.remove({}, cb);
};

module.exports = Chess;
