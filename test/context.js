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

      ctx.should.have.property('finished', false);
      ctx.should.have.property('canceled', false);
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
      parent.canceled = true;
      parent.finished = true;
      var child = parent.create();

      child.should.have.property('ok', true);
      child.should.not.have.property('_fail');
      child.should.have.property('canceled', false);
      child.should.have.property('finished', false);
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

      ctx.once('cancel', function(reason) {
        ctx.should.have.property('canceled', true);
        ctx.should.have.property('finished', false);
        reason.should.equal('test');

        done();
      });
      ctx.cancel('test');
    });

    it('should emit finish when called', function(done) {
      var ctx = context();

      ctx.once('finish', function() {
        ctx.should.have.property('canceled', true);
        ctx.should.have.property('finished', true);

        done();
      });
      ctx.cancel();
    });

    it('should not allow multiple calls', function(done) {
      var ctx = context();

      ctx.once('cancel', function() {
        ctx.should.have.property('canceled', true);

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

        ctx.should.have.property('canceled', false);
        spy.should.have.property('called', false);

        clock.tick(500);

        ctx.should.have.property('canceled', false);
        spy.should.have.property('called', false);

        clock.tick(500);

        ctx.should.have.property('canceled', true);
        spy.should.have.property('called', true);
        spy.args[0][0].should.equal('timeout');

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

  describe('end', function() {
    it('should emit finish when called', function(done) {
      var ctx = context();

      ctx.once('finish', function() {
        ctx.should.have.property('canceled', false);
        ctx.should.have.property('finished', true);

        done();
      });
      ctx.end();
    });

    it('should not allow multiple calls', function(done) {
      var ctx = context();

      ctx.once('finish', function() {
        ctx.should.have.property('canceled', false);
        ctx.should.have.property('finished', true);

        ctx.end().should.be.false;

        done();
      });
      ctx.end().should.be.true;
    });
  });
});
