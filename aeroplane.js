
var request = require('request');
var _ = require('underscore');

var config = require('./config');
var BotApi = require('./lib/botapi');

var ba = new BotApi(config.token, {
  proxyUrl: config.proxy,
  botName: config.bot_name,
});

// define command
ba.commands.on('flee', (upd, followString) => {
  console.log(upd, followString);
  /*this.sendMessage({
    chat_id: chat_id,
    text: '_yk sb_'
  }, function (err, result) {
    console.log(err, result);
  });*/
});

ba.start();
