'use strict';

/**
 * Module dependencies.
 */

require('should');

var meta = require('../package.json');

/**
 * Helper
 */

describe('package.json', function() {
  it('should work', function() {
    meta.should.have.property('name', 'node-context');
    meta.should.have.property('version');
  });
});
