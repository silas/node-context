'use strict';

/**
 * Module dependencies.
 */

var Context = require('./context').Context;

/**
 * Module exports.
 */

var m = module.exports = function(opts) {
  return new m.Context(opts);
};

m.Context = Context;
