/**
 * Context.
 */

'use strict';

/**
 * Module dependencies.
 */

var events = require('events');
var util = require('util');

/**
 * Context instance.
 */

function Context(opts) {
  var self = this;

  events.EventEmitter.call(self);

  opts = opts || {};

  self.done = false;

  // ensure we cleanup context when done
  self.once('done', function() { self.__done(); });

  var now = +new Date();

  // setup deadline/timeout
  if (opts.deadline) {
    self.deadline = +opts.deadline;
  } else if (opts.timeout) {
    self.deadline = now + opts.timeout;
  }

  var parent = opts.parent;

  if (parent) {
    parent.once('done', function() { self.__cancel(); });

    // reduce deadline to parent's or schedule our own shorter deadline
    if (!self.deadline || (parent.deadline && parent.deadline < self.deadline)) {
      self.deadline = parent.deadline;
    } else {
      self.__timeout(now);
    }
  } else if (self.deadline) {
    self.__timeout(now);
  }
}

util.inherits(Context, events.EventEmitter);

/**
 * Cancel
 */

Context.prototype.cancel = Context.prototype.__cancel = function() {
  if (this.done) return false;
  this.done = true;

  this.emit('done');

  return true;
};

/**
 * Create child context
 */

Context.prototype.create = function(opts) {
  opts = opts || {};
  opts.parent = this;
  return new Context(opts);
};

/**
 * Request done, cleanup context
 */

Context.prototype.__done = function() {
  // cancel deadline timeout
  if (this.__timeoutId) clearTimeout(this.__timeoutId);

  // cleanup references
  this.removeAllListeners();
};

/**
 * Schedule timeout
 */

Context.prototype.__timeout = function(now) {
  var self = this;

  var timeout = function() { self.__cancel(); };

  if (self.deadline > now) {
    self.__timeoutId = setTimeout(timeout, self.deadline - now);
  } else {
    process.nextTick(timeout);
  }
};

/**
 * Module exports.
 */

exports.Context = Context;
