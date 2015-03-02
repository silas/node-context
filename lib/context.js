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

  // setup deadline/timeout
  if (options.deadline) {
    self.deadline = +options.deadline;
  } else if (options.timeout) {
    self.deadline = now + options.timeout;
  }

  var parent = options.parent;

  if (parent) {
    parent.once('cancel', function() { self.cancel(); });
    parent.once('done', function() { self.done(); });

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
  if (this._cancel || this._done) return false;
  this._cancel = true;

  this.emit('cancel');

  return this.done();
};

/**
 * Request done, cleanup context
 */

Context.prototype.done = function() {
  var self = this;

  process.nextTick(function() {
    // cancel deadline timeout
    if (self._timeoutId) clearTimeout(self._timeoutId);

    // cleanup references
    self.removeAllListeners();
  });

  if (self._done) return false;
  self._done = true;

  self.emit('done');

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
