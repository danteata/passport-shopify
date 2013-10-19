var vows = require('vows');
var assert = require('assert');
var util = require('util');
var shopify = require('passport-shopify');


vows.describe('passport-shopify').addBatch({
  
  'module': {
    'should report a version': function (x) {
      assert.isString(shopify.version);
    },
  },
  
}).export(module);