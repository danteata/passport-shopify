
/*
 * Module dependencies.
 */
var InternalOAuthError, OAuth2Strategy, Strategy, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

InternalOAuthError = require('passport-oauth').InternalOAuthError;

_ = require('lodash');


/*
 * Inherit `Strategy` from `OAuth2Strategy`.
 */

Strategy = (function(superClass) {
  extend(Strategy, superClass);

  function Strategy(options, verify) {
    options = options || {};
    if (options.shop == null) {
      options.shop = 'example';
    }
    _.defaults(options, {
      authorizationURL: "https://" + options.shop + ".myshopify.com/admin/oauth/authorize",
      tokenURL: "https://" + options.shop + ".myshopify.com/admin/oauth/access_token",
      profileURL: "https://" + options.shop + ".myshopify.com/admin/shop.json",
      userAgent: 'passport-shopify',
      customHeaders: {},
      scopeSeparator: ','
    });
    _.defaults(options.customHeaders, {
      'User-Agent': options.userAgent
    });
    Strategy.__super__.constructor.call(this, options, verify);
    this.name = 'shopify';
    this._profileURL = options.profileURL;
    this._clientID = options.clientID;
    this._clientSecret = options.clientID;
    this._callbackURL = options.callbackURL;
    return;
  }

  Strategy.prototype.userProfile = function(accessToken, done) {
    this._oauth2.get(this._options.profileURL, accessToken, function(err, body, res) {
      var e, error, json, profile;
      if (err) {
        return done(new InternalOAuthError('Failed to fetch user profile', err));
      }
      try {
        json = JSON.parse(body);
        profile = {
          provider: 'shopify'
        };
        profile.id = json.shop.id;
        profile.displayName = json.shop.shop_owner;
        profile.username = json.shop.name;
        profile.profileUrl = json.shop.domain;
        profile.emails = [
          {
            value: json.shop.email
          }
        ];
        profile._raw = body;
        profile._json = json;
        done(null, profile);
      } catch (error) {
        e = error;
        done(e);
      }
    });
  };

  Strategy.prototype.authenticate = function(req, options) {
    _.defaults(options, {
      authorizationURL: "https://" + options.shop + ".myshopify.com/admin/oauth/authorize",
      tokenURL: "https://" + options.shop + ".myshopify.com/admin/oauth/access_token",
      profileURL: "https://" + options.shop + ".myshopify.com/admin/shop.json"
    });
    return Strategy.__super__.authenticate.call(this, req, options);
  };

  return Strategy;

})(OAuth2Strategy);


/*
 * Expose `Strategy`.
 */

module.exports = Strategy;
