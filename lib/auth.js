
var crypto = require('crypto');
var j = require('joi');
var q = require('q');
var config = require('../config/config.js').config;
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
  j.assert(query, {
    content: j.string().required()
  });
  return q.fcall(function() {
    var decipher = crypto.createDecipher('aes-256-ctr', config.secret_key);
    var text = decipher.update(encrypted,'hex','utf8');
    text += decipher.final('utf8');
    return JSON.parse(text);
  });
};

module.exports = auth;