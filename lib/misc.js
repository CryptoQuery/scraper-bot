var axios = require('axios');
var q = require('q');

var auth = require('./auth.js');
var config = require('../config.js');

var misc = {};

//DONE: addArticle <link> <published_at> <author> <title> <description> <article>
misc.addArticle = function(query) {
  return auth.encrypt({content: JSON.stringify(query)}).then(function(data) {
    return axios.post(config.url + '/api/addArticle', {
      content: data
    }).then(function (data) {
      if(data.data.success === true) {
        return data.data.response;
      }
      else {
        throw 'Request failed';
      }
    });
  });
};

//DONE: updateArticle <article_id> <link> <image> <processed> <author> <published_at> <title> <description> <article>
misc.updateArticle = function(query) {
  return auth.encrypt({content: JSON.stringify(query)}).then(function(data) {
    return axios.post(config.url + '/api/updateArticle', {
      content: data
    }).then(function (data) {
      if(data.data.success === true) {
        return data.data.response;
      }
      else {
        throw 'Request failed';
      }
    });
  });
};

//CHECK: getArticlesByUrl <[url]>
misc.getArticlesByUrl = function(query) {
  return axios.post(config.url + '/api/getArticlesByUrl', {
    url: query.url
  }).then(function (data) {
    if(data.data.success === true) {
      return data.data.response;
    }
    else {
      throw 'Request failed';
    }
  });
};

//TODO: getArticlesByDate <start_date> <end_date> <limit> <offset>
misc.getArticlesByDate = function(query) {
  return axios.post(config.url + '/api/getArticlesByDate', {
    start_date: query.start_date,
    end_date: query.end_date,
    limit: query.limit,
    offset: query.offset
  }).then(function (data) {
    if(data.data.success === true) {
      return data.data.response;
    }
    else {
      throw 'Request failed';
    }
  });
};


module.exports = misc;