exports.name = 'Web'
exports.url = 'http://example.com'
exports.description = 'The entire. Frigging. Internet.'

exports.readers = [{
  name: 'XPATH Changed'
, description: 'The contents in a specific location in a page changed'
, public: 'depends'
, options: {
    url: {
      name: 'Webpage URL'
    }
  , xpath: {
      name: 'XPATH Path'
    }
  , value: {
      name: 'Value'
    , required: false
    }
  }
, fields: {
    url: {
      name: 'Webpage URL'
    }
  , old_value: {
      name: 'Old Value'
    }
  , newValue: {
      name: 'New Value'
    }
  , timestamp: {
      name: 'Timestamp'
    }
  }
}]

exports.writers = [{
  name: 'HTTP request'
, description: 'Create a POST request'
, public: 'depends'
, fields: {
    method: {
      name: 'HTTP Method'
    }
  , url: {
      name: 'URL'
    }
  }
}]
