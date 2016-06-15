'use strict'

const fs = require('fs');
const request = require('request');
const _ = require('underscore');

const config = require('./config');
const BotApi = require('./lib/botapi');

var ba = new BotApi(config.token, {
  proxyUrl: config.proxy,
  botName: config.bot_name,
});

// define command
ba.commands.on('flee', (upd, followString) => {
  console.log(upd, followString);
  let chat_id = upd.message.chat.id;
  /*this.sendMessage({
    chat_id: chat_id,
    text: '_yk sb_'
  }, (err, result) => {
    console.log(err, result);
  });*/
  ba.sendPhoto({
    chat_id: chat_id,
    photo: fs.createReadStream('./images/chessmen.png'),
  }, (err, result) => {
    console.log(err, result);
  });
});

ba.start();
