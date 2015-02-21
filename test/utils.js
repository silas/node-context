'use strict';

/**
 * Module dependencies.
 */

require('should');

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
      var Test = function() {
        this.hello1 = 'world1';
        this._one = 'one';
        this.__two = 'two';
        this.domain = {};
        this.deadline = 123;
      };
      Test.prototype.create = function() {
        this.hello2 = 'world2';
      };
      var src = new Test();
      src.create();
      var dst = {};

      utils.copyEvent(src, dst);

      dst.should.have.keys('hello1', 'hello2');
      dst.should.have.property('hello1', 'world1');
      dst.should.have.property('hello2', 'world2');
    });
  });
});
