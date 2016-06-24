/* eslint strict: 0 */
'use strict';

const express = require('express');
const app = express();
const passport = require('passport');
const ShopifyStrategy = require('../../lib/passport-shopify').Strategy;

if (typeof process.env.EMAIL !== 'string') {
  throw new Error('you need to specify EMAIL');
}

if (typeof process.env.CLIENT_ID !== 'string') {
  throw new Error('you need to specify CLIENT_ID');
}

if (typeof process.env.CLIENT_SECRET !== 'string') {
  throw new Error('you need to specify CLIENT_SECRET');
}

/* eslint new-cap: 0 */
const router = express.Router();

const users = [
  { id: 1, email: 'nick@teelaunch.com' },
  { id: 2, email: process.env.EMAIL },
];

function findById(id, fn) {
  const idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error(`User ${id} does not exist`));
  }
}

function findByEmail(email, fn) {
  for (let i = 0, len = users.length; i < len; i++) {
    const user = users[i];
    if (user.email === email) {
      return fn(null, user);
    }
  }

  return fn(null, null);
}

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => {
  findById(id, (err, user) => done(err, user));
});

app.use(passport.initialize());

router.get('/', (req, res) => {
  res.send('visit http://localhost:3000/auth/shopify?shop=your-store-name to begin the auth');
});

router.get('/auth/shopify', (req, res, next) => {
  if (typeof req.query.shop !== 'string') {
    return res.send('req.query.shop was not a string, e.g. /auth/shopify?shop=your-shop-name');
  }

  const time = new Date().getTime();
  passport.use(`shopify-${time}`, new ShopifyStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: `http://localhost:3000/auth/shopify/${time}`,
    shop: req.query.shop,
  }, (accessToken, refreshToken, profile, done) => {
    findByEmail(profile.emails[0].value, (err, user) => {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false, { message: `Unknown user with email ${profile.email}` });
      }

      return done(null, user);
    });
  }));
  return passport.authenticate(`shopify-${time}`, {
    scope: ['read_orders'],
    shop: req.query.shop,
  })(req, res, next);
});

router.get('/auth/shopify/:time', (req, res, next) => {
  if (typeof req.params.time !== 'string') {
    return res.sendStatus(500);
  }

  return passport.authenticate(`shopify-${req.params.time}`, {
    failureRedirect: '/',
  })(req, res, next);
}, (req, res) => {
  // NOTE: notice how we use `passport.unuse` to delete
  // the specific strategy after it is done being used
  passport.unuse(`shopify-${req.params.time}`);
  return res.send({ message: 'successfully logged in', user: req.user });
});

app.use('/', router);

app.listen(3000, () => {
  console.log('server started at http://localhost:3000');
});
