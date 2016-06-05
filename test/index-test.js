import shopify from '../src';

import {
  expect,
}
from 'chai';

describe('passport-shopify', () => {
  describe('module', () => {
    it('should report a version', () => {
      /* eslint-disable no-unused-expressions */
      expect(shopify.version).to.be.String;
    });
  });
});
