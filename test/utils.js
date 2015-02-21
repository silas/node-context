'use strict';

/**
 * Module dependencies.
 */

require('should');

var events = require('events');

var utils = require('../lib/utils');

/**
 * Helper
 */

describe('utils', function() {
  describe('copyEvent', function() {
    it('should copy properties', function() {
      var src = { hello: 'world', one: 2 };
      var dst = {};

      utils.copyEvent(src, dst);

      dst.should.have.keys('hello', 'one');
      dst.should.have.property('hello', 'world');
      dst.should.have.property('one', 2);
    });

    it('should omit hidden and excluded properties', function() {
      var src = new events.EventEmitter();
      src.hello = 'world';
      src._one = 'one';
      src.__two = 'two';
      if (!src.domain) src.domain = {};
      src.deadline = 123;
      var dst = {};

      utils.copyEvent(src, dst);

      dst.should.have.keys('hello');
    });
  });
});
