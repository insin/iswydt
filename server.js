var util = require('util')

var express = require('express')
  , passport = require('passport')
  , redis = require('redis').createClient()
  , RedisStore = require('connect-redis')(express)

var forms = require('./forms')
  , settings = require('./settings')

redis.on('error', function (err) {
  console.error('Redis Error: %s', err)
})

var app = express.createServer()

// Use Jade as the default template engine
app.set('view engine', 'jade')
// Use template inheritance
app.set('view options', { layout: false })

/**
 * Middleware which loads user details when the current user is authenticated.
 */
function loadUser(req, res, next) {
  if (req.session.userId) {
    redis.hgetall(util.format('user:%s', req.session.userId), function(err, user) {
      if (err) {
        return next(
          new Error(util.format('Failed to load user: %s', req.session.userId))
        )
      }
      user.isAuthenticated = true
      req.user = user
      next()
    })
  }
  else {
    req.user = {isAuthenticated: false}
    next()
  }
}

app.configure(function() {
  app.use(express.logger())
  app.use(express.bodyParser())
  app.use(express.cookieParser())
  app.use(express.session({ secret: settings.SESSION_SECRET
                          , store: new RedisStore({client: redis}) }))
  app.use(loadUser)
  app.use(app.router)
  app.use(express.static(__dirname + '/static'))
  app.use(express.errorHandler({ showStack: true, dumpExceptions: true }))
})

// Add variables to the default template context
app.helpers({
  version: require('./package.json').version
})
app.dynamicHelpers({
  user: function(req, res) {
    return req.user
  }
})

app.get('/', function(req, res) {
  res.render('index')
})

app.get('/register', function(req, res) {
  var form = forms.RegisterForm()
  res.render('register', {form: form})
})

app.post('/register', function(req, res) {
  var form = forms.RegisterForm(req.body)
  if (form.isValid()) {
    var data = form.cleanedData
    // TODO Create user
    red
    res.redirect('/profile')
  }
  res.render('register', {form: form})
})

app.get('/login', function(req, res) {
  var form = forms.LoginForm({initial: req.body})
  res.render('login', {form: form})
})

app.post('/login', function(req, res) {
  var form = forms.LoginForm(req.body)
  if (form.isValid()) {
    var data = form.cleanedData
    // TODO Authenticate
    res.redirect('/profile')
  }
  res.render('register', {form: form})
})

app.get('/profile', function(req, res) {
  if (!req.user.isAuthenticated) {
    return res.redirect(util.format('/login?next=%s', req.url))
  }
  res.render('profile')
})

app.listen(3000, '0.0.0.0')
console.log('iswydt server listening on http://127.0.0.1:3000')
