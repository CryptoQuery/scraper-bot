
var q = require('q');
var axios = require('axios');
var _ = require('lodash');
var cheerio = require('cheerio');

var auth = require('./auth.js');
var config = require('../config/config.js').config;

var cointelegraph = {};


// This function may not be used because they are just advertisements
//DONE: pressPages: <url> <category_id> <page>
cointelegraph.pressPages = function(query) {
  return axios.post(query.url, {
    category_id: query.category_id,
    page: query.page,
    lang: 'en',
    region_id: '1'
  }).then(function (result) {
    if(result.data.posts) {
      return q.all(result.data.posts.map(function (result) {
        return {
          title: result.title,
          url: result.url,
          published: result.published
        };
      }));
    }
    else {
      return [];
    }
  });
};

//DONE: articlePages: <url> <tag> <page>
cointelegraph.articlePages = function(query) {
  return axios.post(query.url, {
    tag: query.tag,
    page: query.page
  }).then(function (result) {
    if(result.data.posts) {
      return q.all(result.data.posts.map(function (result) {
        return {
          url: result.url,
          published: result.published,
          author: result.author
        };
      }));
    }
    else {
      return [];
    }
  });
};

//DONE: article: <url>
cointelegraph.article = function(query) {
  return axios.get(query.url).then(function(result) {
    var $ = cheerio.load(result.data);
    var article = [];
    // Check if: "This is a paid press release."
    var title = _.trim($('h1[itemprop="headline"]').first().text());
    $('div[class="post-content"]').find('div[itemprop="articleBody"] > p').each(function(index, element) {
      article.push(_.trim($(element).first().text()));
    });
    return {
      title: title,
      body: _.join(article, ' ')
    };
  });
};

//DONE: addArticle <link> <published_at> <author> <title> <article>
cointelegraph.addArticle = function(query) {
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
cointelegraph.getArticlesByUrl = function(query) {
  return axios.post(config.url + '/api/getArticlesByUrl', query).then(function (result) {
    if(result.data.success === true) {
      return result.data.response;
    }
    else {
      throw 'Error getting articles';
    }
  });
};

module.exports = cointelegraph;