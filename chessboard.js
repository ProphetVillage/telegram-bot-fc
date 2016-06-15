
const fs = reuqire('fs');
const imagemagick = require('imagemagick-native');

fs.writeFileSync('./chess-board-blur.png', imagemagick.convert({
  srcData: fs.readFileSync('./images/chess-board.png'),
  blur: 5,
  format: 'PNG'
}));
