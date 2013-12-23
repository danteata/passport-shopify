/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
  , InternalOAuthError = require('passport-oauth').InternalOAuthError
  , _ = require('underscore')

function Strategy(options, verify) {

  options = options || {}

  if (typeof options.shop === 'undefined')
    throw new TypeError('shop option is required!')

  _.defaults(options, {
    authorizationURL: 'https://' + options.shop + '.myshopify.com/admin/oauth/authorize',
    tokenURL: 'https://' + options.shop + '.myshopify.com/admin/oauth/access_token',
    profileURL: 'https://' + options.shop + '.myshopify.com/admin/shop.json',
    userAgent: 'passport-shopify',
    customHeaders: {},
    scopeSeparator: ','
  })
  _.defaults(options.customHeaders, {
    'User-Agent': options.userAgent
  })

  OAuth2Strategy.call(this, options, verify)
  this.name = 'shopify'

  this._profileURL = options.profileURL
  this._clientID = options.clientID
  this._clientSecret = options.clientID
  this._callbackURL = options.callbackURL
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy)


/**
 * Retrieve user profile from Shopify.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `shopify`
 *   - `id`               the user's Shopify ID
 *   - `username`         the user's Shopify store name
 *   - `displayName`      the user's full name
 *   - `profileUrl`       the URL of the profile for the user on Shopify
 *   - `emails`           the user's email address, only returns emails[0]
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  this._oauth2.get(this._options.profileURL, accessToken, function (err, body, res) {
    if (err)
      return done(new InternalOAuthError('failed to fetch user profile', err))
    try {
      var json = JSON.parse(body)
      var profile = { provider: 'shopify' }
      profile.id = json.shop.id
      profile.displayName = json.shop.shop_owner
      profile.username = json.shop.name
      profile.profileUrl = json.shop.domain
      profile.emails = [
        {
          value: json.shop.email
        }
      ]
      profile._raw = body
      profile._json = json
      done(null, profile)
    } catch(e) {
      done(e)
    }
  })
}


/**
 * Expose `Strategy`.
 */
module.exports = Strategy
