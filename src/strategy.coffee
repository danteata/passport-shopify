###
# Module dependencies.
###
OAuth2Strategy = require('passport-oauth').OAuth2Strategy
InternalOAuthError = require('passport-oauth').InternalOAuthError
_ = require('lodash')

###
# Inherit `Strategy` from `OAuth2Strategy`.
###
class Strategy extends OAuth2Strategy

  constructor: (options, verify) ->

    options = options or {}

    if not options.shop?
      options.shop = 'example'

    shopName = @normalizeShopName options.shop

    _.defaults options,
      authorizationURL: "https://#{shopName}/admin/oauth/authorize"
      tokenURL: "https://#{shopName}/admin/oauth/access_token"
      profileURL: "https://#{shopName}/admin/shop.json"
      userAgent: 'passport-shopify'
      customHeaders: {}
      scopeSeparator: ','

    _.defaults options.customHeaders,
      'User-Agent': options.userAgent

    super(options, verify)

    @name = 'shopify'

    @_profileURL = options.profileURL
    @_clientID = options.clientID
    @_clientSecret = options.clientID
    @_callbackURL = options.callbackURL

    return

  userProfile: (accessToken, done) ->

    @_oauth2.get @_options.profileURL, accessToken, (err, body, res) ->

      if err
        return done(new InternalOAuthError('Failed to fetch user profile', err))
      try
        json = JSON.parse(body)
        profile = provider: 'shopify'
        profile.id = json.shop.id
        profile.displayName = json.shop.shop_owner
        profile.username = json.shop.name
        profile.profileUrl = json.shop.domain
        profile.emails = [ { value: json.shop.email } ]
        profile._raw = body
        profile._json = json
        done null, profile
      catch e
        done e
      return

    return


  authenticate: (req, options) ->

    # If shop is defined
    # with authentication
    if options.shop?

      shopName = @normalizeShopName options.shop

      _.defaults options,
        authorizationURL: "https://#{shopName}/admin/oauth/authorize",
        tokenURL: "https://#{shopName}/admin/oauth/access_token",
        profileURL: "https://#{shopName}/admin/shop.json",

    # Call superclass
    super(req, options)

  normalizeShopName: (shop) ->

    if shop.match /^[a-z0-9-_]+$/i
      "#{shop}.myshopify.com"
    else
      shop



###
# Expose `Strategy`.
###
module.exports = Strategy
