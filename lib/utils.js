/**
 * Utils.
 */

'use strict';

/**
 * Copy properties from one EventListener to another.
 */

var COPY_EVENT_EXCLUDE = {
  canceled: true,
  deadline: true,
  domain: true,
  finished: true,
};

function copyEvent(src, dst) {
  for (var p in src) {
    if (src.hasOwnProperty(p) && p[0] !== '_' && !COPY_EVENT_EXCLUDE[p]) {
      dst[p] = src[p];
    }
  }
  return dst;
}

/**
 * Module exports.
 */

exports.copyEvent = copyEvent;
