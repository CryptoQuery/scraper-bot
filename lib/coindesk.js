var axios = require('axios');
var q = require('q');
var _ = require('lodash');
var cheerio = require('cheerio');
var xss = require('xss');

var config = require('../config.js');

var xssOptions = {
  stripIgnoreTagBody: ["script"]
};
var coindesk = {};

//DONE: getArticlePages <link>
coindesk.getArticlePages = function(query) {
  return axios.get(query.link).then(function (result) {
    var $ = cheerio.load(result.data, {xmlMode: true});
    var html = $.html().replace(/<!\[CDATA\[([\s\S]*?)\]\]>(?=\s*<)/gi, "$1");
    var articles =[];
    $(html).find('channel > item').each(function(index, element) {
      articles.push({
        link: $(element).find('link').text().trim(),
        author: $(element).find('dc\\:creator').text().trim(),
        title: $(element).find('title').text().trim(),
        published: new Date($(element).find('pubDate').text().trim()),
        description: $(element).find('description').text().trim()
      });
    });
    return articles;
  });
};

//DONE: getArticlePage <link>
coindesk.getArticlePage = function(query) {
  return axios.get(query.link).then(function(result) {
    var $ = cheerio.load(result.data);
    var image = $('div[class="article-top"] > div[class="article-top-image-section"]').first().attr('style');
    var content = $('div[class="article-content-container noskimwords"]');
    $(content).find("iframe").remove();
    var article = xss($(content).html(), xssOptions).toString().replace(/\n|\t/g, '');
    return {
      image: image.replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, '').trim(),
      body: article.trim()
    };
  });
};

module.exports = coindesk;