# Context [![Build Status](https://travis-ci.org/silas/node-context.png?branch=master)](https://travis-ci.org/silas/node-context)

Context type that carries deadlines, cancelation signals, and other request-scoped values.

Influenced by Go's [context](https://golang.org/x/net/context).

 * [Documentation](#documentation)
 * [Example](#example)
 * [License](#license)

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
### Event: 'finish'

Emitted when the request is finished.

This is only emitted once.

<a name="context-create"/>
### ctx.create([options])

Create and return a child context.

This accepts the same options as the context constructor and automatically sets the `parent` option.

<a name="context-cancel"/>
### ctx.cancel()

Cancel request immediately.

This is safe to call multiple times.

<a name="context-canceled"/>
### ctx.canceled

True after canceled.

<a name="context-deadline"/>
### ctx.deadline

Time in milliseconds when the request will be canceled if not finished.

<a name="context-end"/>
### ctx.end()

Finish the request, this must be called at the end of the request.

It is safe to call multiple times.

<a name="context-finished"/>
### ctx.finished

True after finished.

<a name="context-values"/>
### ctx.values([object])

Return context values.

If `object` is provided then the context values will be merged into it.

## Example

``` javascript
var context = require('node-context');

function display(ctx, name) {
  ctx.once('cancel', function() {
    console.log('%s canceled after %d ms', name, new Date() - ctx.time);
  });

  ctx.once('finish', function() {
    console.log('%s finished', name);
  });
}

var parent = context();
parent.time = new Date();

var master = parent.create({ timeout: 1000 });

display(parent, 'parent');
display(master, 'master');
display(master.create({ timeout: 500 }), 'worker1');
display(master.create(), 'worker2');

process.on('beforeExit', function() {
  parent.end();
});
```

Output

```
worker1 canceled after 524 ms
worker1 finished
master canceled after 1007 ms
worker2 canceled after 1007 ms
worker2 finished
master finished
parent finished
```

## License

This work is licensed under the MIT License (see the LICENSE file).
