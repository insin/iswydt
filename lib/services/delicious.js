exports.name = 'Delicious'
exports.url = 'https://delicious.com'
exports.description = 'Social bookmarking'

var input = ['username', 'password']

exports.readers = [{
  name: 'Bookmark'
, description: 'Created a bookmark'
, public: false
, options: []
, fields: {
    url: {
      name: 'Bookmark URL'
    , type: 'url'
    }
  , title: {
      name: 'Bookmark Title'
    , type: 'string'
    }
  , description: {
      name: 'Bookmark Description'
    , type: 'string'
    }
  , tags: {
      name: 'Tags'
    , type: 'array'
    }
  , timestamp: {
      name: 'Bookmark Date'
    , type: 'timestamp'
    , format: 'ISO8601'
    }
  }
}]

exports.writers = [{
  name: 'Bookmark'
, description: 'Create a bookmark'
, public: false
, fields: {
    url: {
      name: 'Bookmark URL'
    , type: 'url'
    }
  , title: {
      name: 'Title'
    , type: 'string'
    }
  , description: {
      name: 'Description'
    , type: 'string'
    }
  , tags: {
      name: 'Tags'
    , type: 'array'
    }
  , replace: {
      name: 'Replace if already bookmarked'
    , type: 'boolean'
    , defaults: false
    }
  , shared: {
      name: 'Shared'
    , type: 'boolean'
    , defaults: false
    }
  }
}]
