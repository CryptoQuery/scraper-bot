var axios = require('axios');
var q = require('q');
var _ = require('lodash');
var cheerio = require('cheerio');
var xss = require('xss');

var config = require('../config.js');

var xssOptions = {
  stripIgnoreTagBody: ["script"]
};
var themerkle = {};

//DONE: getArticlePages <page> <url>
themerkle.getArticlePages = function(query) {
  return axios.post(query.url + '/page/' + query.page).then(function (result) {
    var $ = cheerio.load(result.data);
    var articleUrls =[];
    $('div[id="content_box"]').find('article').each(function(index, element) {
      articleUrls.push({
        link: $(element).find('a').attr('href'),
        description: _.trim(_.replace($(element).find('div[class="front-view-content"]').text(), /\r?\n|\r/g, ''))
      });
    });
    return articleUrls;
  });
};

//DONE: getArticlePage <url>
themerkle.getArticlePage = function(query) {
  return axios.get(query.url).then(function(result) {
    var $ = cheerio.load(result.data);
    var title =$('header > h1[itemprop="name headline"]').first().text().trim();
    var infoElement = $('div[class="post-info"]');
    var author = $(infoElement).find('span[itemprop="author"]').first().text().trim();
    var published = $(infoElement).find('span[itemprop="datePublished dateModified"] > span').first().text().trim();
    var image = $('header > div[itemprop="image"] > img').first().attr('src');
    var content = $('div[class="thecontent"]');
    $(content).find('div[class="nc_tweetContainer twitter"]').parent().remove();
    $(content).find("iframe").remove();
    $(content).find('amp-ad').remove();
    var article = xss($(content).html(), xssOptions).toString().replace(/\n|\t/g, '');
    return {
      image: image,
      title: title,
      author: author,
      published: new Date(published),
      body: article
    };
  });
};

module.exports = themerkle;