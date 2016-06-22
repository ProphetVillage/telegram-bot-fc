
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
  console.log(chess.chessboard);
  chess.next(4);
  console.log(chess.chessboard);
  chess.takeoff();
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
});

}, 1000);
