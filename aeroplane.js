
var request = require('request');
var _ = require('underscore');

var config = require('./config');
var BotApi = require('./lib/botapi');

var ba = new BotApi(config.token, {
  proxyUrl: config.proxy
});
ba.start();
