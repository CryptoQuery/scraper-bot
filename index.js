
var _ = require('lodash');
var q = require('q');
var cron = require('cron').CronJob;

var coindesk = require('./lib/coindesk.js');
var themerkle = require('./lib/themerkle.js');
var misc = require('./lib/misc.js');


var config = {
  coindesk: {
    categories: [
      'https://feeds.feedburner.com/CoinDesk',
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

//DONE: Get coindesk.com Articles (30 mins)
new cron('0 0 0 1 * *', function() {
  q.fcall(function() {
    // Get articles form Coin Desk
    return coindesk.getArticlePages({
      link: config.coindesk.categories[0]
    }).then(function (articles) {
      // Check if articles exist
      return misc.getArticlesByUrl({
        url: _.map(articles, 'link')
      }).then(function (result) {
        // Get article information
        return _.orderBy(_.differenceBy(articles, result, 'link'), ['published'], ['asc']).reduce(function (chain, current) {
          return chain.then(function (previous) {
            return q.delay(1000).then(function () {
              return coindesk.getArticlePage({
                link: current.link
              }).then(function (article) {
                return misc.addArticle({
                  link: current.link,
                  image: article.image,
                  author: current.author,
                  published_at: isNaN(Date.parse(current.published)) ? new Date().toISOString() : current.published,
                  title: current.title,
                  description: current.description,
                  article: article.body
                }).then(function() {
                  console.log("Added article: ", current.link);
                });
              }).catch(function(error) {
                console.log("Error adding article: ", current.link);
              });
            });
          });
        }, q([]));
      });
    }).catch(function (error) {
      console.log(error);
    });
  });
}, null, true, 'America/Los_Angeles');

//DONE: Get themerkle.com Articles (30 mins)
new cron('0 0 0 1 * *', function() {
  q.fcall(function() {
    // Get articles form Coin Desk
    return _.range(1,2).reduce(function (chain, current) {
      return chain.then(function (previous) {
        return themerkle.getArticlePages({
          url: config.themerkle.categories[0],
          page: current
        }).then(function (articles) {
          // Check if articles exist
          return misc.getArticlesByUrl({
            url: _.map(articles, 'link')
          }).then(function (result) {
            // Get article information
            return _.differenceBy(articles, result, 'link').reduce(function (chain, current) {
              return chain.then(function (previous) {
                return q.delay(1000).then(function () {
                  return themerkle.getArticlePage({
                    url: current.link
                  }).then(function (article) {
                    return misc.addArticle({
                      link: current.link,
                      image: article.image,
                      author: article.author,
                      published_at: isNaN(Date.parse(article.published)) ? new Date().toISOString() : article.published,
                      title: article.title,
                      description: current.description,
                      article: article.body
                    }).then(function() {
                      console.log("Added article: " + current.link);
                    });
                  }).catch(function(error) {
                    console.error('Error adding article: ' + current.link);
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
