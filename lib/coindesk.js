
var axios = require('axios');
var _ = require('lodash');
var cheerio = require('cheerio');

var auth = require('./auth.js');
var config = require('../config/config.js').config;

var coindesk = {};

//DONE: getArticlePages <url> <page>
coindesk.getArticlePages = function(query) {
  return axios.post(query.url + '/page/' + query.page).then(function (result) {
    var $ = cheerio.load(result.data);
    var articleUrls =[];
    $('div[id="content"]').find('div > div[class="post-info"] > h3 > a').each(function(index, element) {
      articleUrls.push($(element).attr('href'));
    });
    return articleUrls;
  });
};

//DONE: getArticlePage <url>
coindesk.getArticlePage = function(query) {
  return axios.get(query.url).then(function(result) {
    var $ = cheerio.load(result.data);
    var article = [];
    var title = _.trim($('h3[class="featured-article-title"]').first().text());
    var authorElement = $('p[class="timeauthor"]').first();
    var author = $(authorElement).find('a').first().text();
    var published = $(authorElement).find('time').first().attr('datetime');
    $('div[class="article-content-container noskimwords"]').find('p').each(function(index, element) {
      article.push(_.trim($(element).first().text()));
    });
    return {
      title: title,
      author: author,
      published: published,
      body: _.join(article, ' ')
    };
  });
};

//DONE: addArticle <link> <published_at> <author> <title> <article>
coindesk.addArticle = function(query) {
  return auth.encrypt({
    content: JSON.stringify(query)
  }).then(function (result) {
    return axios.post(config.url + '/api/addArticle', {
      content: result
    }).then(function (result) {
      if(result.data.success === true) {
        return result.data.response;
      }
      else {
        throw 'Error adding article';
      }
    });
  });
};

//DONE: getArticlesByUrl <[url]>
coindesk.getArticlesByUrl = function(query) {
  return axios.post(config.url + '/api/getArticlesByUrl', query).then(function (result) {
    if(result.data.success === true) {
      return result.data.response;
    }
    else {
      throw 'Error getting articles';
    }
  });
};

module.exports = coindesk;