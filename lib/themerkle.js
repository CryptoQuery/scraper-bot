var axios = require('axios');
var q = require('q');
var _ = require('lodash');
var cheerio = require('cheerio');

var auth = require('./auth.js');
var config = require('../config.js');

var themerkle = {};

//DONE: getArticlePages <page> <url>
themerkle.getArticlePages = function(query) {
  return axios.post(query.url + '/page/' + query.page).then(function (result) {
    var $ = cheerio.load(result.data);
    var articleUrls =[];
    $('div[id="content_box"]').find('article > a').each(function(index, element) {
      articleUrls.push($(element).attr('href'));
    });
    return articleUrls;
  });
};

//DONE: getArticlePage <url>
themerkle.getArticlePage = function(query) {
  return axios.get(query.url).then(function(result) {
    var $ = cheerio.load(result.data);
    var article = [];
    var title = _.trim($('header > h1[itemprop="name headline"]').first().text());
    var infoElement = $('div[class="post-info"]');
    var author = $(infoElement).find('span[itemprop="author"]').first().text();
    var published = $(infoElement).find('span[itemprop="datePublished dateModified"] > span').first().text();
    $('div[class="thecontent"]').find('p').each(function(index, element) {
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

//TODO: addArticle <link> <published_at> <author> <title> <article>
themerkle.addArticle = function(query) {
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

//TODO: getArticlesByUrl <[url]>
themerkle.getArticlesByUrl = function(query) {
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

module.exports = themerkle;