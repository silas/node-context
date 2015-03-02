# Context [![Build Status](https://travis-ci.org/silas/node-context.png?branch=master)](https://travis-ci.org/silas/node-context)

Context type that carries deadlines, cancelation signals, and other request-scoped values.

Influenced by Go's [context](https://golang.org/x/net/context).

## Usage

``` javascript
var context = require('node-context');

function display(ctx, name) {
  ctx.once('cancel', function() {
    console.log('%s cancel %d (deadline %d)', name, new Date() - ctx.time, ctx.deadline);
  });

  ctx.once('done', function() {
    console.log('%s done', name);
  });
}

var main = context();
main.time = new Date();

var master = main.create({ timeout: 1000 });

display(main, 'main');
display(master, 'master');
display(master.create({ timeout: 500 }), 'worker1');
display(master.create(), 'worker2');

process.on('beforeExit', function() {
  main.done();
});
```

Output

```
worker1 cancel 532 (deadline 1425278555679)
worker1 done
master cancel 1009 (deadline 1425278556175)
worker2 cancel 1010 (deadline 1425278556175)
worker2 done
master done
main done
```

## Documentation

<a name="context"/>
### context.Context([options])

Initialize a new context.

Options

 * deadline (Number, optional): time when request expires (milliseconds since Unix epoch)
 * timeout (Number, optional): duration in milliseconds until request expires
 * parent (Context, optional): parent context; inherits deadlines, cancelation signals, and properties

<a name="context-event-cancel"/>
### Event: 'cancel'

Emitted when the request exceeds it's deadline or is canceled.

This is only emitted once.

<a name="context-event-done"/>
### Event: 'done'

Emitted when the request is done.

This is only emitted once.

<a name="context-create"/>
### ctx.create([options])

Create and return a child context.

This accepts the same options as the context constructor and automatically sets the `parent` option.

<a name="context-cancel"/>
### ctx.cancel()

Cancel request immediately.

This is safe to call multiple times.

<a name="context-deadline"/>
### ctx.deadline

Time in milliseconds since Unix epoch when the request will be canceled if not done.

<a name="context-done"/>
### ctx.done()

Mark the request as done.

This should always be called when the request is finished and is safe to call multiple times.

## License

This work is licensed under the MIT License (see the LICENSE file).
