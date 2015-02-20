'use strict';

/**
 * Module dependencies.
 */

var Context = require('./context').Context;

/**
 * Module exports.
 */

var m = module.exports = function(options) {
  return new m.Context(options);
};

m.Context = Context;
