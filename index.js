
var _ = require('lodash');
var q = require('q');
var cron = require('cron').CronJob;

var coindesk = require('./lib/coindesk.js');
var themerkle = require('./lib/themerkle.js');


var config = {
  coindesk: {
    categories: [
      'https://www.coindesk.com/category/technology-news',
      'https://www.coindesk.com/category/markets-news',
      'https://www.coindesk.com/category/business-news'
    ]
  },
  cointelegraph: {
    postUrl: 'https://cointelegraph.com/api/v1/ajax/categories/next',
    press: [
      {
        url: 'https://cointelegraph.com/press-releases',
        category_id: 58
      }
    ],
    tags: [
      'bitcoin',
      'ethereum',
      'altcoin',
      'blockchain',
      'bitcoin-regulation',
      'bitcoin-scams'
    ]
  },
  themerkle: {
    categories: [
      'https://themerkle.com/category/news/crypto',
      'https://themerkle.com/category/news/finance'
    ]
  }
};

//CHECK: Get coindesk.com Articles (30 mins)
new cron('0 */30 * * * *', function() {
  q.fcall(function() {
    console.log("Getting Coindesk articles");
    // Get articles form Coin Desk
    return _.range(1,2).reduce(function (chain, current) {
      return chain.then(function (previous) {
        return coindesk.getArticlePages({
          url: config.coindesk.categories[0],
          page: current
        }).then(function (links) {
          // Check if articles exist
          return coindesk.getArticlesByUrl({
            url: links
          }).then(function (result) {
            // Get article information
            return _.difference(links, _.map(result, 'link')).reduce(function (chain, current) {
              return chain.then(function (previous) {
                return q.delay(1000).then(function () {
                  return coindesk.getArticlePage({
                    url: current
                  }).then(function (article) {
                    return coindesk.addArticle({
                      link: current,
                      author: article.author,
                      published_at: isNaN(Date.parse(article.published)) ? new Date().toISOString() : article.published,
                      title: article.title,
                      article: article.body
                    }).then(function() {
                      console.log("Added article: " + current);
                    });
                  }).catch(function() {
                    console.log("Error adding article: " + current);
                  });
                });
              });
            }, q([]));
          });
        });
      });
    }, q([])).catch(function (error) {
      console.error(error);
    });
  });
}, null, true, 'America/Los_Angeles');

//CHECK: Get themerkle.com Articles (30 mins)
new cron('0 */31 * * * *', function() {
  q.fcall(function() {
    console.log("Getting The Merkle articles");
    // Get articles form Coin Desk
    return _.range(1,2).reduce(function (chain, current) {
      return chain.then(function (previous) {
        return themerkle.getArticlePages({
          url: config.themerkle.categories[0],
          page: current
        }).then(function (links) {
          // Check if articles exist
          return themerkle.getArticlesByUrl({
            url: links
          }).then(function (result) {
            // Get article information
            return _.difference(links, _.map(result, 'link')).reduce(function (chain, current) {
              return chain.then(function (previous) {
                return q.delay(1000).then(function () {
                  return themerkle.getArticlePage({
                    url: current
                  }).then(function (article) {
                    return themerkle.addArticle({
                      link: current,
                      author: article.author,
                      published_at: isNaN(Date.parse(article.published)) ? new Date().toISOString() : article.published,
                      title: article.title,
                      article: article.body
                    }).then(function() {
                      console.log("Added article: " + current);
                    });
                  }).catch(function(error) {
                    console.error('Error adding article: ' + current);
                  });
                });
              });
            }, q([]));
          });
        });
      });
    }, q([])).catch(function (error) {
      console.error(error);
    });
  });
}, null, true, 'America/Los_Angeles');