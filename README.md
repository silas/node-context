# Context [![Build Status](https://travis-ci.org/silas/node-context.png?branch=master)](https://travis-ci.org/silas/node-context)

Context type that carries deadlines and cancelation signals.

Influenced by Go's [context](https://golang.org/x/net/context).

## Documentation

<a name="context"/>
### context.Context([options])

Initialize a new context.

Options

 * deadline (Number, optional): time when request expires (milliseconds since Unix epoch)
 * timeout (Number, optional): duration in milliseconds until request expires
 * parent (Context, optional): parent context, inherits deadlines and cancelation signals

<a name="context-event-done"/>
### Event: 'done'

Emitted when the request exceeds it's deadline or is canceled.

This is only emitted once.

<a name="context-cancel"/>
### context.cancel()

Cancel request immediately.

This is safe to call multiple times.

<a name="context-create"/>
### context.create([options])

Create and return a child context.

This accepts the same options as the context constructor and automatically sets the `parent` option.

<a name="context-deadline"/>
### context.deadline

Number of milliseconds since Unix epoch.

## License

This work is licensed under the MIT License (see the LICENSE file).
