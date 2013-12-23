
var express = require('express')
var app = express()
var path = require('path')
var passport = require('passport')
var ShopifyStrategy = require('../../lib/passport-shopify').Strategy

if (typeof process.env.EMAIL !== 'string')
  throw new Error('you need to specify EMAIL')

if (typeof process.env.CLIENT_ID !== 'string')
  throw new Error('you need to specify CLIENT_ID')

if (typeof process.env.CLIENT_SECRET !== 'string')
  throw new Error('you need to specify CLIENT_SECRET')

var users = [
    { id: 1, email: 'nick@teelaunch.com' }
  , { id: 2, email: process.env.EMAIL }
]

function findById(id, fn) {
  var idx = id - 1
  if (users[idx]) {
    fn(null, users[idx])
  } else {
    fn(new Error('User ' + id + ' does not exist'))
  }
}

function findByEmail(email, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i]
    if (user.email === email)
      return fn(null, user)
  }
  return fn(null, null)
}

passport.serializeUser(function(user, done) {
  done(null, user.id)
})

passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) {
    done(err, user)
  })
})

app.configure(function() {
  app.use(express.logger())
  app.use(express.cookieParser())
  app.use(express.json())
  app.use(express.urlencoded())
  app.use(express.methodOverride())
  app.use(express.session({ secret: 'keyboard cat' }))
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(app.router)
})

app.get('/', function(req, res) {
  res.send('visit http://localhost:3000/auth/shopify?shop=your-store-name to begin the auth')
})

app.get('/auth/shopify', function(req, res, next) {
  if (typeof req.query.shop !== 'string')
    return res.send('req.query.shop was not a string, e.g. /auth/shopify?shop=your-shop-name')
  var time = new Date().getTime()
  passport.use('shopify-' + time, new ShopifyStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/shopify/' + time,
    shop: req.query.shop
  }, function(accessToken, refreshToken, profile, done) {
    findByEmail(profile.emails[0].value, function(err, user) {
      if (err)
        return done(err)
      if (!user)
        return done(null, false, { message: 'Unknown user with email ' + profile.email })
      return done(null, user)
    })
  }))
  passport.authenticate('shopify-' + time, {
    scope: [ 'read_orders' ],
    shop: req.query.shop
  })(req, res, next)
})

app.get('/auth/shopify/:time', function(req, res, next) {
  if (typeof req.params.time !== 'string')
    return res.send(500)
  passport.authenticate('shopify-' + req.params.time, {
    failureRedirect: '/'
  })(req, res, next)
}, function(req, res, next) {
  // NOTE: notice how we use `passport.unuse` to delete
  // the specific strategy after it is done being used
  passport.unuse('shopify-' + req.params.time)
  res.send({ message: 'successfully logged in', user: req.user })
})

app.listen(3000, function() {
  console.log('server started at http://localhost:3000')
})
