
exports.config = {
  secret_key: '',
  url: ''
};

exports.coindesk = {
  categories: [
    'https://www.coindesk.com/category/technology-news',
    'https://www.coindesk.com/category/markets-news',
    'https://www.coindesk.com/category/business-news'
  ]
};

exports.cointelegraph = {
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
};