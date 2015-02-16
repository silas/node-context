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

      ctx.should.have.property('done', false);
      ctx.should.not.have.property('__timeout');
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

  describe('cancel', function() {
    it('should emit done when called', function(done) {
      var ctx = context();

      ctx.once('done', function() {
        ctx.should.have.property('done', true);

        done();
      });
      ctx.cancel();
    });

    it('should not allow cancel to be called multiple times', function(done) {
      var ctx = context();

      ctx.once('done', function() {
        ctx.should.have.property('done', true);

        ctx.cancel().should.be.false;

        done();
      });
      ctx.cancel().should.be.true;
    });
  });

  describe('deadline', function() {
    it('should emit done when exceeded', function() {
      var clock = sinon.useFakeTimers();
      var timeout = 1000;

      var ctx = context({ timeout: timeout });
      var spy = sinon.spy();

      ctx.on('done', spy);

      try {
        ctx.should.have.property('deadline', 1000);

        ctx.should.have.property('done', false);
        spy.should.have.property('called', false);

        clock.tick(500);

        ctx.should.have.property('done', false);
        spy.should.have.property('called', false);

        clock.tick(500);

        ctx.should.have.property('done', true);
        spy.should.have.property('called', true);

        clock.restore();
      } catch (err) {
        clock.restore();
        throw err;
      }
    });

    it('should emit done immediately if in the past', function(done) {
      var cancel = context.Context.prototype.cancel;

      var stub = this.sinon.stub(context.Context.prototype, 'cancel', function() {
        return cancel.apply(this, arguments);
      });

      var ctx = context({ deadline: new Date() - 1000 });

      ctx.once('done', function() {
        stub.should.have.property('called', true);

        done();
      });
    });
  });

  describe('create', function() {
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
});
