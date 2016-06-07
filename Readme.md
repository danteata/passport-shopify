# Passport-Shopify

[![NPM Version](https://img.shields.io/npm/v/passport-shopify.svg)](https://www.npmjs.com/package/passport-shopify)
[![Build Status](https://img.shields.io/travis/danteata/passport-shopify/master.svg)](https://travis-ci.org/danteata/passport-shopify)
[![Coverage Status](https://img.shields.io/codecov/c/github/danteata/passport-shopify/master.svg)](https://codecov.io/gh/danteata/passport-shopify/branch/master)

[Passport](http://passportjs.org/) strategy for authenticating with
[Shopify](https://shopify.com/) using the OAuth 2.0 API.

This module lets you authenticate using Shopify in your Node.js applications.
By plugging into Passport, Shopify authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

```bash
npm install -S passport-shopify
```

## Usage

#### Configure Strategy

**NOTE**: Unlike other OAuth2 passport strategies, this requires a specific `shop` if you want it to be dynamic.

The Shopify authentication strategy authenticates users using a Shopify account
and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which accepts
these credentials and calls `done` providing a user, as well as `options`
specifying a client ID, client secret, and callback URL.

**Static Shop Name**:

```js
passport.use(
  new ShopifyStrategy({
    clientID: SHOPIFY_CLIENT_ID,
    clientSecret: SHOPIFY_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/shopify/callback",
    shop: SHOPIFY_SHOP_SLUG // e.g. my-shop-name.myshopify.com ... the `my-shop-name` part
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ shopifyId: profile.id }, function (err, user) {
      return done(err, user);
    });
  })
)
```

**Dynamic Shop Name**:

See [example](https://github.com/danteata/passport-shopify/tree/master/example/dynamic/) folder.


#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'shopify'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```js
app.get(
  '/auth/shopify',
  passport.authenticate('shopify', {
    scope: [ 'read_products' ],
    shop: 'storename'
  })
)

app.get(
  '/auth/shopify/callback',
  passport.authenticate('shopify', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/')
  }
)
```

## Examples

For a complete, working example, refer to the [example](https://github.com/danteata/passport-shopify/tree/master/example/).

## Tests

```js
npm install -d
npm run test
```

## Contributors

* [Dantheta](http://github.com/danteata)
* [Nick Baugh](https://github.com/niftylettuce)
* [Igor Goltsov](https://github.com/riversy)
* [Sebastian Iacomuzzi](https://github.com/siacomuzzi)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2011-2016 Dantheta and Nick Baugh
