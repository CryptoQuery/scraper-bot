
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
    // random initialization vector
    var iv = crypto.randomBytes(12);
    // random salt
    var salt = crypto.randomBytes(64);
    // derive key: 64 byte key length
    var key = crypto.pbkdf2Sync(config.secret_key, salt, 100000, 32, 'sha512');
    // AES 256 GCM Mode
    var cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    // encrypt the given text
    var encrypted = Buffer.concat([cipher.update(query.content, 'utf8'), cipher.final()]);
    // extract the auth tag
    var tag = cipher.getAuthTag();
    // generate output
    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
  });
};

// decrypt <content>
auth.decrypt = function(query) {
  return q.fcall(function() {
    j.assert(query, {
      content: j.string().required()
    });
    // base64 decoding
    var bData = new Buffer(query.content, 'base64');
    // convert data to buffers
    var salt = bData.slice(0, 64);
    var iv = bData.slice(64, 76);
    var tag = bData.slice(76, 92);
    var text = bData.slice(92);
    // derive key using; 64 byte key length
    var key = crypto.pbkdf2Sync(config.secret_key, salt , 100000, 32, 'sha512');
    // AES 256 GCM Mode
    var decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    // encrypt the given text
    var decrypted = decipher.update(text, 'binary', 'utf8') + decipher.final('utf8');
    return JSON.parse(decrypted);
  });
};

module.exports = auth;