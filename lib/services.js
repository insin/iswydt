var fs = require('fs')
  , path = require('path')

var all = exports.all = []

fs.readdirSync(path.join(__dirname, 'services')).forEach(function(file) {
  var module = file.replace('.js', '')
    , service = require('./services/' + module)
  all.push(service)
  exports[service.name] = service
})

all.sort(function(a, b) {
  if (a.name < b.name) return -1
  if (a.name > b.name) return 1
  return 0
})