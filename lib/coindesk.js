var axios = require('axios');
var q = require('q');
var _ = require('lodash');
var cheerio = require('cheerio');

var auth = require('./auth.js');
var config = require('../config.js');

var coindesk = {};

//DONE: getArticlePages <link>
coindesk.getArticlePages = function(query) {
  return axios.get(query.link).then(function (result) {
    var $ = cheerio.load(result.data, {xmlMode: true});
    var html = $.html().replace(/<!\[CDATA\[([\s\S]*?)\]\]>(?=\s*<)/gi, "$1");
    var articles =[];
    $(html).find('channel > item').each(function(index, element) {
      articles.push({
        link: $(element).find('link').text(),
        author: $(element).find('dc\\:creator').text(),
        title: $(element).find('title').text(),
        published: new Date($(element).find('pubDate').text()),
        description: $(element).find('description').text()
      });
    });
    return articles;
  });
};

//DONE: getArticlePage <link>
coindesk.getArticlePage = function(query) {
  return axios.get(query.link).then(function(result) {
    var $ = cheerio.load(result.data);
    var article = [];
    $('div[class="article-content-container noskimwords"]').find('p').each(function(index, element) {
      article.push(_.trim($(element).first().text()));
    });
    return {
      body: _.join(article, ' ')
    };
  });
};

//DONE: addArticle <link> <published_at> <author> <title> <description> <article>
coindesk.addArticle = function(query) {
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

//DONE: getArticlesByUrl <[link]>
coindesk.getArticlesByUrl = function(query) {
  return axios.post(config.url + '/api/getArticlesByUrl', {
    url: query.link
  }).then(function (data) {
    if(data.data.success === true) {
      return data.data.response;
    }
    else {
      throw 'Request failed';
    }
  });
};

module.exports = coindesk;