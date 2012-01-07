var crypto = require('crypto')
  , util = require('util')

var express = require('express')
  , passport = require('passport')
  , redis = require('redis')
  , RedisStore = require('connect-redis')(express)

var forms = require('./forms')
  , settings = require('./settings')
  , services = require('./lib/services')

// ------------------------------------------------------- Utils & Shortcuts ---

var $f = util.format

// ------------------------------------------------------------------- Redis ---

$r = redis.createClient()
$r.on('error', function (err) {
  console.error('Redis Error: %s', err)
})

function getUserByUsername(username, cb) {
  $r.get($f('username.to.id:%s', username.toLowerCase()), function(err, id) {
    if (err) return cb(err)
    if (!id) return cb(null, null)
    getUserById(id, cb)
  })
}

function getUserById(id, cb) {
  $r.hgetall($f('user:%s', id), function(err, user) {
    if (err) return cb(err)
    cb(null, user)
  })
}

function createUser(username, email, password, cb) {
  $r.incr('users.count', function(err, id) {
    if (err) return cb(err)
    $r.set($f('username.to.id:%s', username.toLowerCase()), id, function(err) {
      if (err) return cb(err)
      var user = {id: id, username: username, email: email}
      getRandom(function(err, salt) {
        if (err) return cb(err)
        hashPassword(password, salt, function(err, hp) {
          if (err) return cb(err)
          user.salt = salt
          user.password = hp
          $r.hmset($f('user:%s', id), user, function(err) {
            if (err) return cb(err)
            cb(null, user)
          })
        })
      })
    })
  })
}

// ---------------------------------------------------- Auth/Passport Config ---

function getRandom(cb) {
  crypto.randomBytes(20, function(err, buf) {
    if (err) return cb(err)
    cb(null, buf.toString('hex'))
  })
}

function hashPassword(password, salt, cb) {
  crypto.pbkdf2(password, salt, settings.PBKDF2_ITERATIONS, 160/8,
  function(err, derivedKey) {
    if (err) return cb(err)
    cb(null, new Buffer(derivedKey).toString('hex'))
  })
}

/**
 * Authenticates the given username and password, returning a user object if
 * successful, otherwise null.
 */
function validateCredentials(username, password, cb) {
  getUserByUsername(username, function(err, user) {
    if (err) return cb(err)
    if (!user) {
      return cb(null, null)
    }
    hashPassword(password, user.salt, function(err, hp) {
      if (err) return cb(err)
      var authenticated = (hp == user.password)
      cb(null, authenticated ? user : null)
    })
  })
}

// ---------------------------------------------------------- Express Config ---

var app = express.createServer()

// Use Jade as the default template engine
app.set('view engine', 'jade')
// Use template inheritance
app.set('view options', { layout: false })

/**
 * Middleware which loads user details when the current user is authenticated.
 */
function loadUser(req, res, next) {
  var userId = req.session.userId
  if (userId) {
    getUserById(userId, function(err, user) {
      if (err) return next(err)
      if (!user) return next(new Error($f('User %s not found', userId)))
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
                          , store: new RedisStore({client: $r}) }))
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

// ------------------------------------------------------- Routes & Handlers ---

app.get('/', function(req, res) {
  res.render('index')
})

app.get('/register', function(req, res) {
  if (req.user.isAuthenticated) return res.redirect('/profile')
  var form = forms.RegisterForm()
  res.render('register', {form: form})
})

app.post('/register', function(req, res, next) {
  if (req.user.isAuthenticated) return res.redirect('/profile')
  var form = forms.RegisterForm({data: req.body})
    , redisplay = function() { res.render('register', {form: form}) }
  if (!form.isValid()) return redisplay()
  var data = form.cleanedData
  getUserByUsername(data.username, function(err, user) {
    if (err) return next(err)
    if (user) {
      form.addError('username', 'This username is already taken.')
      return redisplay()
    }
    createUser(data.username, data.email, data.password, function(err, user) {
      if (err) return next(err)
      req.session.userId = user.id
      res.redirect('/profile')
    })
  })
})

app.get('/login', function(req, res) {
  if (req.user.isAuthenticated) return res.redirect('/profile')
  var form = forms.LoginForm({initial: req.query})
  res.render('login', {form: form})
})

app.post('/login', function(req, res, next) {
  if (req.user.isAuthenticated) return res.redirect('/profile')
  var form = forms.LoginForm({data: req.body})
    , redisplay = function() { res.render('login', {form: form}) }
  if (!form.isValid()) return redisplay()
  var data = form.cleanedData
  validateCredentials(data.username, data.password, function(err, user) {
    if (!user) {
      form.addFormError('Username/password did not match.')
      return redisplay()
    }
    // Authorised
    req.session.userId = user.id
    if (data.next) {
      return res.redirect(data.next)
    }
    res.redirect('/profile')
  })
})

app.get('/logout', function(req, res, next) {
  req.session.destroy(function(err) {
    res.redirect('/')
  })
})

app.get('/profile', function(req, res) {
  if (!req.user.isAuthenticated) return res.redirect($f('/login?next=%s', req.url))
  res.render('profile')
})

app.get('/services', function(req, res) {
  res.render('services', {services: services.all})
})

app.get('/services/:name', function(req, res) {
  if (!services.hasOwnProperty(req.params.name)) {
    return res.render('404')
  }
  res.render('service', {service: services[req.params.name]})
})

app.use(function(req, res, next) {
  res.render('404')
})

// ----------------------------------------------------------------- Startup ---

app.listen(3000, '0.0.0.0')
console.log('iswydt server listening on http://127.0.0.1:3000')
