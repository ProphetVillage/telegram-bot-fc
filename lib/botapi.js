
var request = require('request');
var _ = require('underscore');

const TG_BOT_URL = 'https://api.telegram.org/bot';
const DEF_LONG_POLLING_TIMEOUT = 30; // 30s

function BotApi(token, opts) {
  this.token_url = TG_BOT_URL + token;
  this.opts = opts ? opts : {};
}

BotApi.prototype.urlMethod = function (method) {
  return (this.token_url + '/' + method);
};

BotApi.prototype.start = function () {
  this.polling();
};

// process single update
BotApi.prototype.process = function (upd) {
  console.log(upd.message.entities);
  var chat_id = upd.message.chat.id;
  this.sendMessage({
    chat_id: chat_id,
    text: '_yk sb_'
  }, function (err, result) {
    console.log(err, result);
  });
};

// long polling function
BotApi.prototype.polling = function () {
  var self = this;
  this.getUpdates((err, updates) => {
    if (err) {
      console.error(err);
    } else {
      // it should be an array
      updates.forEach(function (upd) {
        if (upd.update_id) {
          // Identifier of the first update to be returned.
          // Must be greater by one than the highest among the identifiers
          //   of previously received updates.
          self.update_id = upd.update_id + 1;
        }
        self.process(upd);
      });
    }
    // go on polling
    self.polling();
  });
};

BotApi.prototype.post = function (method, formdata, opts, cb) {
  var _opts = {
    method: 'POST',
    url: this.urlMethod(method),
    form: formdata,
    gzip: true,
    json: true
  };
  if (this.opts.proxyUrl) {
    _opts.proxy = this.opts.proxyUrl;
    //_opts.tunnel = false;
  }
  if (typeof(opts) === 'function') {
    cb = opts;
    opts = {};
  }
  opts = _.extend(_opts, opts);

  request(opts, (err, resp, body) => {
    if (err) {
      cb(err);
    } else if (typeof(body) === 'object') {
      if (body.ok) {
        if (typeof(body.result) === 'object') {
          cb(null, body.result);
        } else {
          cb('unformatted result');
        }
      } else {
        cb(body);
      }
    } else {
      cb(body ? body : 'unknown error');
    }
 });
};

BotApi.prototype.getUpdates = function (cb) {
  var formdata = {
    timeout: DEF_LONG_POLLING_TIMEOUT,
  };
  if (this.update_id) {
    formdata.offset = this.update_id;
  }

  this.post('getUpdates', formdata, {
    timeout: DEF_LONG_POLLING_TIMEOUT * 1000,
  }, cb);
};

BotApi.prototype.sendMessage = function (params, cb) {
  this.post('sendMessage', params, cb ? cb : () => {});
};

module.exports = BotApi;
