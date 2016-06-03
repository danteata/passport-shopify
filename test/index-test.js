import shopify from '../src';
import { expect } from 'chai';

describe('passport-shopify', () => {
  describe('module', () => {
    it('should report a version', () => {
      expect(shopify.version).to.be.a.String;
    });
  });
});
