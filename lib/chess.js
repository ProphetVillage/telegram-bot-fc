'use strict'

const _ = require('underscore');

// 0: havent takeoff

function Chess() {
  this.chessboard = {
    red: [0, 0, 0, 0],
    blue: [0, 0, 0, 0],
    green: [0, 0, 0, 0],
    yellow: [0, 0, 0, 0],
  };
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

Chess.prototype.join = function () {
  
};

Chess.prototype.currentPlayer = function () {
};

Chess.prototype.load = function (chat_id, cb) {
  // load from database
};

Chess.prototype.next = function (num) {
};

Chess.prototype.takeoff = function () {
};

Chess.prototype.save = function (cb) {
  // save to database
};

module.exports = Chess;
