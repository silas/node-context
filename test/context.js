'use strict';

/**
 * Module dependencies.
 */

require('should');

var sinon = require('sinon');

var context = require('../lib');

/**
 * Helper
 */

describe('Context', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create();
  });

  afterEach(function() {
    this.sinon.restore();
  });

  describe('constructor', function() {
    it('should work', function() {
      var ctx = new context.Context();

      ctx.should.not.have.property('_done');
      ctx.should.not.have.property('_timeoutId');
    });

    it('should call timeout if deadline specified', function(done) {
      var deadline = 1000;

      this.sinon.stub(context.Context.prototype, '_timeout', function() {
        this.should.have.property('deadline', deadline);

        done();
      });

      new context.Context({ deadline: deadline });
    });

    it('should call timeout if timeout specified', function(done) {
      var timeout = 1000;

      this.sinon.stub(context.Context.prototype, '_timeout', function(now) {
        this.should.have.property('deadline', now + timeout);

        done();
      });

      new context.Context({ timeout: timeout });
    });
  });

  describe('create', function() {
    it('should copy parent properties', function() {
      var parent = context();
      parent.ok = true;
      parent._fail = true;
      var child = parent.create();

      child.should.have.property('ok', true);
      child.should.not.have.property('_fail');
    });

    it('should use parent deadline if not defined', function() {
      this.sinon.spy(context.Context.prototype, '_timeout');

      var deadline = 1000;
      var parent = context({ deadline: deadline });
      var child = parent.create();

      child.should.have.property('deadline', deadline);
    });

    it('should use parent deadline if less', function() {
      this.sinon.spy(context.Context.prototype, '_timeout');

      var deadline = 1000;
      var parent = context({ deadline: deadline });
      var child = parent.create({ deadline: 1000 });

      child.should.have.property('deadline', deadline);
    });

    it('should use child deadline if less', function() {
      this.sinon.spy(context.Context.prototype, '_timeout');

      var deadline = 1000;
      var parent = context({ deadline: 2000 });
      var child = parent.create({ deadline: 1000 });

      child.should.have.property('deadline', deadline);
    });
  });

  describe('cancel', function() {
    it('should emit cancel when called', function(done) {
      var ctx = context();

      ctx.once('cancel', function() {
        ctx.should.have.property('_cancel', true);

        done();
      });
      ctx.cancel();
    });

    it('should emit done when called', function(done) {
      var ctx = context();

      ctx.once('done', function() {
        ctx.should.have.property('_cancel', true);
        ctx.should.have.property('_done', true);

        done();
      });
      ctx.cancel();
    });

    it('should not allow cancel to be called multiple times', function(done) {
      var ctx = context();

      ctx.once('cancel', function() {
        ctx.should.have.property('_cancel', true);

        ctx.cancel().should.be.false;

        done();
      });
      ctx.cancel().should.be.true;
    });
  });

  describe('deadline', function() {
    it('should emit cancel when exceeded', function() {
      var clock = sinon.useFakeTimers();
      var timeout = 1000;

      var ctx = context({ timeout: timeout });
      var spy = sinon.spy();

      ctx.on('cancel', spy);

      try {
        ctx.should.have.property('deadline', 1000);

        ctx.should.not.have.property('_cancel');
        spy.should.have.property('called', false);

        clock.tick(500);

        ctx.should.not.have.property('_cancel');
        spy.should.have.property('called', false);

        clock.tick(500);

        ctx.should.have.property('_cancel', true);
        spy.should.have.property('called', true);

        clock.restore();
      } catch (err) {
        clock.restore();
        throw err;
      }
    });

    it('should emit cancel immediately if in the past', function(done) {
      var cancel = context.Context.prototype.cancel;

      var stub = this.sinon.stub(context.Context.prototype, 'cancel', function() {
        return cancel.apply(this, arguments);
      });

      var ctx = context({ deadline: new Date() - 1000 });

      ctx.once('cancel', function() {
        stub.should.have.property('called', true);

        done();
      });
    });
  });

  describe('done', function() {
    it('should emit done when called', function(done) {
      var ctx = context();

      ctx.once('done', function() {
        ctx.should.not.have.property('_cancel');
        ctx.should.have.property('_done', true);

        done();
      });
      ctx.done();
    });

    it('should not allow done to be called multiple times', function(done) {
      var ctx = context();

      ctx.once('done', function() {
        ctx.should.have.property('_done', true);

        ctx.done().should.be.false;

        done();
      });
      ctx.done().should.be.true;
    });
  });
});
