import util from 'util';
import { expect } from 'chai';
import ShopifyStrategy from '../src';
import assert from 'assert';
import nock from 'nock';
import { InternalOAuthError } from 'passport-oauth2';

let count = 0;
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
          customHeaders: { 'User-Agent': 'example2.com' },
        }, () => {});
    });

    it('should have correct user agent', () => {
      expect(strategy._oauth2._customHeaders['User-Agent']).to
        .equal('example2.com');
    });
  });

  describe('strategy with user agent option in custom headers and explicit option', () => {
    let strategy;
    beforeEach(() => {
      strategy = new ShopifyStrategy({
          clientID: 'ABC123',
          clientSecret: 'secret',
          customHeaders: { 'User-Agent': 'example2.com' },
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

      let body = `{ "shop": { "name": "octocat", "id": 1,
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
        strategy.userProfile('access-token', (err, profile) => {
          expect(err).to.be.null;
          done();
        });
      });

      it('should load profile', (done) => {
        strategy.userProfile('access-token', (err, profile) => {
          expect(profile.provider).to.equal('shopify');
          expect(profile.id).to.equal(1);
          expect(profile.username).to.equal('octocat');
          expect(profile.displayName).to.equal('monalisa octocat');
          expect(profile.emails).to.have.lengthOf(1);
          expect(profile.profileURL).to.equal('https://shopify.com/octocat');
          done();
        });
      });

      it('should set raw property', (done) => {
        strategy.userProfile('access-token', (err, profile) => {
          expect(profile._raw).to.be.String;
          done();
        });
      });

      it('should set json property', (done) => {
        strategy.userProfile('access-token', (err, profile) => {
          expect(profile._json).to.be.Object;
          done();
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

      let body = `{ "shop": { "name": "octocat", "id": 1,
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
        strategy.userProfile('access-token', (err, profile) => {
          expect(err).to.be.null;
          done();
        });
      });

      it('should load profile', (done) => {
        strategy.userProfile('access-token', (err, profile) => {
          expect(profile.provider).to.equal('shopify');
          expect(profile.id).to.equal(1);
          expect(profile.username).to.equal('octocat');
          expect(profile.displayName).to.equal('monalisa octocat');
          expect(profile.emails).to.have.lengthOf(1);
          expect(profile.emails[0].value).to.equal('octocat@shopify.com');
          expect(profile.profileURL).to.equal('https://shopify.com/octocat');
          done();
        });
      });

      it('should set raw property', (done) => {
        strategy.userProfile('access-token', (err, profile) => {
          expect(profile._raw).to.be.String;
          done();
        });
      });

      it('should set json property', (done) => {
        strategy.userProfile('access-token', (err, profile) => {
          expect(profile._json).to.be.Object;
          done();
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

      let body = `{ "shop": { "name": "octocat", "id": 1,
        "shop_owner": "monalisa octocat", "email": "octocat@shopify.com",
        "domain": "https://shopify.com/octocat" } }`;

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
        strategy.userProfile('access-token', (err, profile) => {
          expect(err).to.exist;
          done();
        });
      });

      it('should wrap error in InternalOAuthError', (done) => {
        strategy.userProfile('access-token', (err, profile) => {
          expect(err).to.be.an.instanceof(InternalOAuthError);
          done();
        });
      });

      it('should not load profile', (done) => {
        strategy.userProfile('access-token', (err, profile) => {
          expect(profile).to.equal(undefined);
          done();
        });
      });
    });
  });
});
