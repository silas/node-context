# Context [![Build Status](https://travis-ci.org/silas/node-context.png?branch=master)](https://travis-ci.org/silas/node-context)

Context type that carries deadlines, cancelation signals, and other request-scoped values.

Influenced by Go's [context](https://golang.org/x/net/context).

## Usage

``` javascript
var context = require('node-context');

function work(ctx, name) {
  ctx.once('done', function() {
    console.log(name + ' done %d (deadline %d)', new Date() - ctx.time, ctx.deadline);
  });
}

function main() {
  var ctx = context({ timeout: 1000 });
  ctx.time = new Date();

  ctx.once('done', function() {
    console.log('main done %d (deadline %d)', new Date() - ctx.time, ctx.deadline);
  });

  work(ctx.create({ timeout: 500 }), 'work1');
  work(ctx.create(), 'work2');
}

main();
```

Output

```
work1 done 524 (deadline 1424550908411)
main done 1002 (deadline 1424550908908)
work2 done 1005 (deadline 1424550908908)
```

## Documentation

<a name="context"/>
### context.Context([options])

Initialize a new context.

Options

 * deadline (Number, optional): time when request expires (milliseconds since Unix epoch)
 * timeout (Number, optional): duration in milliseconds until request expires
 * parent (Context, optional): parent context; inherits deadlines, cancelation signals, and properties

<a name="context-event-done"/>
### Event: 'done'

Emitted when the request exceeds it's deadline or is canceled.

This is only emitted once.

<a name="context-cancel"/>
### ctx.cancel()

Cancel request immediately.

This is safe to call multiple times.

<a name="context-create"/>
### ctx.create([options])

Create and return a child context.

This accepts the same options as the context constructor and automatically sets the `parent` option.

<a name="context-deadline"/>
### ctx.deadline

Number of milliseconds since Unix epoch.

## License

This work is licensed under the MIT License (see the LICENSE file).
