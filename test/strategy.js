import ShopifyStrategy from '../src';
import nock from 'nock';
import {
  InternalOAuthError,
}
from 'passport-oauth2';
import chai from 'chai';
import dirtyChai from 'dirty-chai';
const expect = chai.expect;
chai.use(dirtyChai);

describe('ShopifyStrategy', () => {
  describe('strategy', () => {
    let strategy;
    beforeEach(() => {
      strategy = new ShopifyStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret',
      }, () => {});
    });

    it('should be named shopify', () => {
      expect(strategy.name).to.equal('shopify');
    });

    it('should have default user agent', () => {
      expect(strategy._oauth2._customHeaders['User-Agent']).to
        .equal('passport-shopify');
    });
  });

  describe('strategy with user agent option', () => {
    let strategy;
    beforeEach(() => {
      strategy = new ShopifyStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret',
        userAgent: 'example.com',
      }, () => {});
    });

    it('should have correct user agent', () => {
      expect(strategy._oauth2._customHeaders['User-Agent']).to
        .equal('example.com');
    });
  });

  describe('strategy with user agent option in custom headers', () => {
    let strategy;
    beforeEach(() => {
      strategy = new ShopifyStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret',
        customHeaders: {
          'User-Agent': 'example2.com',
        },
      }, () => {});
    });

    it('should have correct user agent', () => {
      expect(strategy._oauth2._customHeaders['User-Agent']).to
        .equal('example2.com');
    });
  });

  describe(
    'strategy with user agent option in custom headers and explicit option', () => {
      let strategy;
      beforeEach(() => {
        strategy = new ShopifyStrategy({
          clientID: 'ABC123',
          clientSecret: 'secret',
          customHeaders: {
            'User-Agent': 'example2.com',
          },
          userAgent: 'example3.com',
        }, () => {});
      });

      it('should prefer custom headers', () => {
        expect(strategy._oauth2._customHeaders['User-Agent']).to
          .equal('example2.com');
      });
    });

  describe('strategy when loading user profile', () => {
    let strategy;
    beforeEach((done) => {
      strategy = new ShopifyStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret',
      }, () => {});

      const body =
        `{ "shop": { "name": "octocat", "id": 1,
        "shop_owner": "monalisa octocat", "email": "octocat@shopify.com",
        "domain": "https://shopify.com/octocat" } }`;
      nock('https://example.myshopify.com')
        .get('/admin/shop.json')
        .query({
          access_token: 'access-token',
        })
        .reply(200, body);

      done();
    });

    afterEach(() => nock.cleanAll());

    describe('when told to load user profile', () => {
      it('should not throw an error', (done) => {
        strategy.userProfile('access-token', done);
      });

      it('should load profile', (done) => {
        strategy.userProfile('access-token', (err, profile) => {
          if (err) {
            return done(err);
          }

          expect(profile.provider).to.equal('shopify');
          expect(profile.id).to.equal(1);
          expect(profile.username).to.equal('octocat');
          expect(profile.displayName).to.equal(
            'monalisa octocat');
          expect(profile.emails).to.have.lengthOf(1);
          expect(profile.profileURL).to.equal(
            'https://shopify.com/octocat');
          return done();
        });
      });

      it('should set raw property', (done) => {
        strategy.userProfile('access-token', (err, profile) => {
          if (err) {
            return done(err);
          }

          expect(profile._raw).to.be.a('string');
          return done();
        });
      });

      it('should set json property', (done) => {
        strategy.userProfile('access-token', (err, profile) => {
          if (err) {
            return done(err);
          }

          expect(profile._json).to.be.instanceof(Object);
          return done();
        });
      });
    });
  });

  describe('strategy when loading user profile from custom URL', () => {
    let strategy;
    beforeEach((done) => {
      strategy = new ShopifyStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret',
        profileURL: 'https://shopify.corpDomain/api/v3/user',
      }, () => {});

      const body =
        `{ "shop": { "name": "octocat", "id": 1,
        "shop_owner": "monalisa octocat", "email": "octocat@shopify.com",
        "domain": "https://shopify.com/octocat" } }`;

      nock('https://shopify.corpDomain/api/v3')
        .get('/user')
        .query({
          access_token: 'access-token',
        })
        .reply(200, body);

      done();
    });

    afterEach(() => nock.cleanAll());

    describe('when told to load user profile', () => {
      it('should not throw an error', (done) => {
        strategy.userProfile('access-token', done);
      });

      it('should load profile', (done) => {
        strategy.userProfile('access-token', (err, profile) => {
          if (err) {
            return done(err);
          }

          expect(profile.provider).to.equal('shopify');
          expect(profile.id).to.equal(1);
          expect(profile.username).to.equal('octocat');
          expect(profile.displayName).to.equal(
            'monalisa octocat');
          expect(profile.emails).to.have.lengthOf(1);
          expect(profile.emails[0].value).to.equal(
            'octocat@shopify.com');
          expect(profile.profileURL).to.equal(
            'https://shopify.com/octocat');
          return done();
        });
      });

      it('should set raw property', (done) => {
        strategy.userProfile('access-token', (err, profile) => {
          if (err) {
            return done(err);
          }

          expect(profile._raw).to.be.String;
          return done();
        });
      });

      it('should set json property', (done) => {
        strategy.userProfile('access-token', (err, profile) => {
          if (err) {
            return done(err);
          }

          expect(profile._json).to.be.Object;
          return done();
        });
      });
    });
  });

  describe('strategy when loading user profile and encountering an error', () => {
    let strategy;
    beforeEach((done) => {
      strategy = new ShopifyStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret',
      }, () => {});

      nock('https://example.myshopify.com')
        .get('/admin/shop.json')
        .query({
          access_token: 'access-token',
        })
        .replyWithError(new Error('something-went-wrong'));

      done();
    });

    afterEach(() => nock.cleanAll());

    describe('when told to load user profile', () => {
      it('should error', (done) => {
        strategy.userProfile('access-token', (err) => {
          expect(err).to.be.an.instanceof(Error);
          return done();
        });
      });

      it('should wrap error in InternalOAuthError', (done) => {
        strategy.userProfile('access-token', (err) => {
          expect(err).to.be.an.instanceof(
            InternalOAuthError);
          return done();
        });
      });

      it('should not load profile', (done) => {
        strategy.userProfile('access-token', (err, profile) => {
          expect(profile).to.be.an('undefined');
          return done();
        });
      });
    });
  });
});
