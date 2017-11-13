
var q = require('q');
var _ = require('lodash');

var coindesk = require('./lib/coindesk.js');
var cointelegraph = require('./lib/cointelegraph.js');

var config = require('./config/config.js');

// coindesk.com
console.log("Getting articles from Coindesk.com...");
q.fcall(function() {
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
          return _.difference(links, result.map(function(o) {
            return o.link;
          })).reduce(function (chain, current) {
            return chain.then(function (previous) {
              return q.delay(500).then(function () {
                return coindesk.getArticlePage({
                  url: current
                }).then(function (article) {
                  return coindesk.addArticle({
                    link: current,
                    author: article.author,
                    published_at: isNaN(Date.parse(article.published)) ? new Date().toISOString() : article.published,
                    title: article.title,
                    article: article.body
                  }).then(function (result) {
                    console.log("Added Article: " + article.title);
                    return previous.concat([result]);
                  });
                });
              });
            });
          }, q([])).then(function (result) {
            return previous.concat(result);
          });
        });
      });
    });
  }, q([])).then(function (result) {
    console.log("Completed Coindesk articles");
  }).catch(function (error) {
    console.error(error);
  });
})
// cointelegraph.com
.then(function (result) {
  console.log("Getting articles from Cointelegraph.com");
  // Get articles from Coin Telegraph
  return _.range(1,2).reduce(function (chain, current) {
    return chain.then(function (previous) {
      // Get all article urls in current page
      return cointelegraph.articlePages({
        url: config.cointelegraph.postUrl,
        tag: config.cointelegraph.tags[0],
        page: current
      }).then(function (links) {
        // Check if articles exist
        return cointelegraph.getArticlesByUrl({
          url: links.map(function(o) {
            return o.url
          })
        }).then(function (result) {
          // Remove all duplicate articles
          var diff = _.difference(links.map(function(o) {
            return o.url;
          }), result.map(function(o) {
            return o.link;
          }));
          return _.filter(links, function(o) {
            return diff.indexOf(o.url) !== -1;
          }).reduce(function (chain, current) {
            return chain.then(function (previous) {
              return q.delay(500).then(function () {
                return cointelegraph.article({
                  url: current.url
                }).then(function (article) {
                  // Append information for each article
                  return cointelegraph.addArticle({
                    link: current.url,
                    author: current.author,
                    published_at: isNaN(Date.parse(current.published)) ? new Date().toISOString() : current.published,
                    title: article.title,
                    article: article.body
                  }).then(function (result) {
                    console.log("Added article: " + article.title);
                    return previous.concat([result]);
                  });
                });
              });
            });
          }, q([])).then(function (result) {
            return previous.concat(result);
          });
        });
      });
    });
  }, q([]))
  .then(function (result) {
    console.log("Completed Coin Telegraph articles");
  })
  .catch(function (error) {
    console.error(error);
  });
});
