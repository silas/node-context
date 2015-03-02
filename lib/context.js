/**
 * Context.
 */

'use strict';

/**
 * Module dependencies.
 */

var events = require('events');
var util = require('util');

var utils = require('./utils');

/**
 * Context instance.
 */

function Context(options) {
  var self = this;

  events.EventEmitter.call(self);

  options = options || {};

  var now = +new Date();

  this.canceled = false;
  this.finished = false;

  // setup deadline/timeout
  if (options.deadline) {
    self.deadline = +options.deadline;
  } else if (options.timeout) {
    self.deadline = now + options.timeout;
  }

  var parent = options.parent;

  if (parent) {
    parent.once('cancel', function() { self.cancel(); });
    parent.once('finish', function() { self.end(); });

    utils.copyEvent(parent, this);

    // reduce deadline to parent's or schedule our own shorter deadline
    if (!self.deadline || (parent.deadline && parent.deadline < self.deadline)) {
      self.deadline = parent.deadline;
    } else {
      self._timeout(now);
    }
  } else if (self.deadline) {
    self._timeout(now);
  }
}

util.inherits(Context, events.EventEmitter);

/**
 * Create child context
 */

Context.prototype.create = function(options) {
  options = options || {};
  options.parent = this;
  return new Context(options);
};

/**
 * Cancel
 */

Context.prototype.cancel = function() {
  if (this.canceled || this.finished) return false;
  this.canceled = true;

  this.emit('cancel');

  return this.end();
};

/**
 * Request finished, cleanup context
 */

Context.prototype.end = function() {
  var self = this;

  process.nextTick(function() {
    // cancel deadline timeout
    if (self._timeoutId) clearTimeout(self._timeoutId);

    // cleanup references
    self.removeAllListeners();
  });

  if (self.finished) return false;
  self.finished = true;

  self.emit('finish');

  return true;
};

/**
 * Schedule timeout
 */

Context.prototype._timeout = function(now) {
  var self = this;

  var timeout = function() { self.cancel(); };

  if (self.deadline > now) {
    self._timeoutId = setTimeout(timeout, self.deadline - now);
  } else {
    process.nextTick(timeout);
  }
};

/**
 * Module exports.
 */

exports.Context = Context;
