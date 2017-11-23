
var crypto = require('crypto');
var q = require('q');
var j = require('joi');
var config = require('../config.js');
var auth = {};

// encrypt <content>
auth.encrypt = function(query) {
  return q.fcall(function() {
    j.assert(query, {
      content: j.string().required()
    });
    var cipher = crypto.createCipher('aes-256-ctr', config.secret_key);
    var encrypted = cipher.update(query.content,'utf8','hex');
    encrypted += cipher.final('hex');
    return encrypted;
  });
};

// decrypt <content>
auth.decrypt = function(query) {
  return q.fcall(function() {
    j.assert(query, {
      content: j.string().required()
    });
    var decipher = crypto.createDecipher('aes-256-ctr', config.secret_key);
    var text = decipher.update(query.content,'hex','utf8');
    text += decipher.final('utf8');
    return JSON.parse(text);
  });
};

module.exports = auth;