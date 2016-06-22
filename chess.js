
const config = require('./config');

const DB = require('./lib/db');
const Chess = require('./lib/chess');

var db = new DB(config.db);

setTimeout(() => {
var chess = new Chess(db);
var chat_id = 0;
chess.load(chat_id, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  chess.join(1, 't1');
  chess.join(2, 't2');
  if (chess.start()) {
    console.log(chess.playerlist);
    console.log(chess.chessboard);
    chess.takeoff();
    console.log(chess.chessboard);
    chess.next(0, 4);
    console.log(chess.chessboard);
    chess.moveNext();
    chess.save((err, r) => {
      if (err) {
        console.log(err);
        return;
      }
      // TODO: show result
      
      chess.end(() => {
        db.close();
      });
    });
  } else {
    console.log('failed to start');
    db.close();
  }
});

}, 1000);
