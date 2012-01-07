exports.name = 'GitHub'
exports.url = 'https://github.com'
exports.description = 'Online project hosting using Git'

var input = 'username'

exports.readers = [{
  name: 'Repository watched'
, description: 'You watched a new repository'
, public: true
, options: []
, fields: {
    name: {
      name: 'Repository Name'
    , type: 'url'
    , path: '/html_url'
    }
  , url: {
      name: 'Repository URL'
    , type: 'url'
    , path: '/html_url'
    }
  , timestamp: {
      name: 'Watched At'
    , type: 'timestamp'
    , path: '/created_at'
    , format: 'ISO8601'
    }
  , language: {
      name: 'Programming Language'
    , type: 'string'
    , path: '/language'
    }
  }
}]

exports.writers = []
