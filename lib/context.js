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
 * Constants
 */

var COPY_EXCLUDE = {
  canceled: true,
  deadline: true,
  domain: true,
  finished: true,
};

/**
 * Context instance.
 */

function Context(options) {
  var self = this;

  events.EventEmitter.call(self);

  options = options || {};

  var now = +new Date();

  self.canceled = false;
  self.finished = false;

  // setup deadline/timeout
  if (options.deadline) {
    self.deadline = +options.deadline;
  } else if (options.timeout) {
    self.deadline = now + options.timeout;
  }

  var parent = options.parent;

  if (parent) {
    if (options.values !== false) {
      parent.values(self);
    }

    if (options.cancel !== false) {
      if (parent.canceled) {
        process.nextTick(function() { self.cancel('dead'); });
      } else if (parent.finished) {
        process.nextTick(function() { self.end(); });
      } else {
        parent.once('cancel', function(reason) { self.cancel(reason); });
        parent.once('finish', function() { self.end(); });
      }

      // reduce deadline to parent's or schedule our own shorter deadline
      if (!self.deadline || (parent.deadline && parent.deadline < self.deadline)) {
        self.deadline = parent.deadline;
      } else if (!parent.canceled && !parent.finished) {
        self._timeout(now);
      }
    } else if (self.deadline) {
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

Context.prototype.cancel = function(reason) {
  if (this.canceled || this.finished) return false;
  this.canceled = true;

  this.emit('cancel', reason);

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
 * Return or merges values
 */

Context.prototype.values = function(obj) {
  obj = obj || {};

  for (var p in this) {
    if (this.hasOwnProperty(p) && p[0] !== '_' && !COPY_EXCLUDE[p]) {
      obj[p] = this[p];
    }
  }

  return obj;
};

/**
 * Schedule timeout
 */

Context.prototype._timeout = function(now) {
  var self = this;

  var timeout = function() { self.cancel('timeout'); };

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
