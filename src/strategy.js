/*
 * Module dependencies.
 */
import {
  InternalOAuthError, Strategy as OAuth2Strategy,
}
from 'passport-oauth2';
import {
  isUndefined, defaults,
}
from 'lodash';

const SHOP_NAME_SLUG = /^[a-z0-9-_]+$/i;

/*
 * Inherit `Strategy` from `OAuth2Strategy`.
 */
class Strategy extends OAuth2Strategy {

  constructor(options = {}, verify) {
    defaults(options, {
      shop: 'example',
    });

    let shopName;
    if (options.shop.match(SHOP_NAME_SLUG)) {
      shopName = `${options.shop}.myshopify.com`;
    } else {
      shopName = options.shop;
    }

    defaults(options, {
      authorizationURL: `https://${shopName}/admin/oauth/authorize`,
      tokenURL: `https://${shopName}/admin/oauth/access_token`,
      profileURL: `https://${shopName}/admin/shop.json`,
      userAgent: 'passport-shopify',
      customHeaders: {},
      scopeSeparator: ',',
    });

    defaults(options.customHeaders, {
      'User-Agent': options.userAgent,
    });

    super(options, verify);
    this.name = 'shopify';

    this._profileURL = options.profileURL;
    this._clientID = options.clientID;
    this._clientSecret = options.clientSecret;
    this._callbackURL = options.callbackURL;
  }

  userProfile(accessToken, done) {
    this._oauth2.get(this._profileURL, accessToken, (err, body) => {
      if (err) {
        return done(
          new InternalOAuthError('Failed to fetch user profile', err));
      }

      try {
        const json = JSON.parse(body);
        const profile = {
          provider: 'shopify',
        };
        profile.id = json.shop.id;
        profile.displayName = json.shop.shop_owner;
        profile.username = json.shop.name;
        profile.profileURL = json.shop.domain;
        profile.emails = [{
          value: json.shop.email,
        }];
        profile._raw = body;
        profile._json = json;
        return done(null, profile);
      } catch (e) {
        return done(e);
      }
    });
  }

  authenticate(req, options) {
    // If shop is defined
    // with authentication
    if (!isUndefined(options.shop)) {
      const shopName = this.normalizeShopName(options.shop);

      // update _oauth2 settings
      this._oauth2._authorizeUrl =
        `https://${shopName}/admin/oauth/authorize`;
      this._oauth2._accessTokenUrl =
        `https://${shopName}/admin/oauth/access_token`;
      this._profileURL = `https://${shopName}/admin/shop.json`;
    }

    // Call superclass
    return super.authenticate(req, options);
  }

  normalizeShopName(shop) {
    if (shop.match(SHOP_NAME_SLUG)) {
      return `${shop}.myshopify.com`;
    }

    return shop;
  }
}

/*
 * Expose `Strategy`.
 */
export default Strategy;
