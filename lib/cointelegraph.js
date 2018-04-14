var axios = require('axios');
var q = require('q');
var _ = require('lodash');
var cheerio = require('cheerio');
var xss = require('xss');

var config = require('../config.js');

var xssOptions = {
  stripIgnoreTagBody: ["script"]
};
var cointelegraph = {};

//CHECK: getArticlePages <link>
cointelegraph.getArticlePages = function(query) {
  return axios.get(query.link).then(function (result) {
    var $ = cheerio.load(result.data);
    var articles =[];
    $('div[id="feeditemnodes"] > div.rssitem').each(function(index, element) {
      var article = {
        link: $(element).find('a[class="ext_link"]').first().attr('href').trim(),
        title: $(element).find('a[class="ext_link"]').first().text().trim(),
        description: ''
      };
      $(element).find('div.actdesc > p').each(function(index, element) {
        if(index === 1) article.description = $(element).text().trim();
      });
      articles.push(article);
    });
    return articles;
  });
};

//DONE: getArticlePage <link>
cointelegraph.getArticlePage = function(query) {
  return axios.get(query.link).then(function(result) {
    var $ = cheerio.load(result.data);
    var articleHeader = $('div.post-header').first();
    var articleBody = $('div.post-content');
    $(articleBody).find("iframe").remove();
    var article = xss($(articleBody).find('div[itemprop="articleBody"]').html(), xssOptions).toString().replace(/\n|\t/g, '');
    return {
      author: $(articleHeader).find('div.user > div.name > a').first().text().trim(),
      published: $(articleHeader).find('div.date').first().attr('datetime').trim(),
      image: _.split($(articleBody).find('div.image > img').first().attr('srcset').trim(), ' ')[0],
      body: article.trim()
    };
  });
};

module.exports = cointelegraph;