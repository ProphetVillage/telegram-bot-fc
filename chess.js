
const config = require('./config');

const DB = require('./lib/db');
const Chess = require('./lib/chess');

var db = new DB(config.db);

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

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
    
    
    while (true) {
      var num = getRandomInt(1, 7);
      var takeoff = false;
      if (num === 6) {
        if (chess.takeoff()) {
          takeoff = true;
        }
      } 
      if (!takeoff) {
        var choice = 0;
        var nomove = true;
        while (choice < 4) {
          if (chess.next(choice, num)) {
            nomove = false;
            break;
          } else {
            choice++;
          }
        }
        if (nomove) {
          console.log(chess.currentPlayer().chessman, 
            num, choice, 'nomove');
        } else {
          console.log(chess.currentPlayer().chessman, 
            num, choice, chess.chessboard);
        }
      } else {
        console.log(chess.currentPlayer().chessman, 
          'takeoff', chess.chessboard);
      }
      
      var win = chess.checkWin();
      //console.log('checkWin', win);
      if (win && chess.isEnded()) {
        console.log('win! and end');
        break;
      } else {
        chess.moveNext();
      }
    }
    
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
