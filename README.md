# Passport-Shopify

[Passport](http://passportjs.org/) strategy for authenticating with [Shopify](https://shopify.com/)
using the OAuth 2.0 API.

This module lets you authenticate using Shopify in your Node.js applications.
By plugging into Passport, Shopify authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-shopify

## Usage

#### Configure Strategy

The Shopify authentication strategy authenticates users using a Shopify account
and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which accepts
these credentials and calls `done` providing a user, as well as `options`
specifying a client ID, client secret, and callback URL.

    passport.use(new ShopifyStrategy({
        clientID: SHOPIFY_CLIENT_ID,
        clientSecret: SHOPIFY_CLIENT_SECRET,
        callbackURL: "http://127.0.0.1:3000/auth/shopify/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ shopifyId: profile.id }, function (err, user) {
          return done(err, user);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'shopify'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/shopify',
      passport.authenticate('shopify'));

    app.get('/auth/shopify/callback', 
      passport.authenticate('shopify', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });

## Examples

For a complete, working example, refer to the [login example](https://github.com/danteata/passport-shopify/tree/master/examples/login).

## Tests

    $ npm install --dev
    $ make test

[![Build Status](https://secure.travis-ci.org/danteata/passport-shopify.png)](http://travis-ci.org/danteata/passport-shopify)

## Credits

  - [Dantheta](http://github.com/danteata)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2011-2013 Dantheta
