# redux-graphql-subscriptions

A Redux middleware for handling GraphQL subscriptions.

This repo leverages [subscriptions-transport-ws](https://github.com/apollographql/subscriptions-transport-ws) which is the awesome work of the Apollo guys [over here](https://github.com/apollographql).

## API

*createGraphQLSubscriptionsMiddleware(url, options)*
### `createGraphQLSubscriptionsMiddleware(url, options)`
- `url: string` : url that the client will connect to, starts with `ws://` or `wss://`
- `options?: Object` : optional, object to modify default client behavior
  * `timeout?: number` : how long the client should wait in ms for a keep-alive message from the server (default 10000 ms), this parameter is ignored if the server does not send keep-alive messages. This will also be used to calculate the max connection time per connect/reconnect
  * `lazy?: boolean` : use to set lazy mode - connects only when first subscription created, and delay the socket initialization
  * `connectionParams?: Object | Function` : object that will be available as first argument of `onConnect` (in server side), if passed a function - it will call it and send the return value
  * `reconnect?: boolean` : automatic reconnect in case of connection error
  * `reconnectionAttempts?: number` : how much reconnect attempts
  * `connectionCallback?: (error) => {}` : optional, callback that called after the first init message, with the error (if there is one)
- `webSocketImpl?: Object` - optional, WebSocket implementation. use this when your environment does not have a built-in native WebSocket (for example, with NodeJS client) 

### `subscribe(subscription)`
- `subscription: Object` : the required fields for a subscription
  * `id: string` : id to register the subscription under
  * `query: string` : GraphQL subscription
  * `success: function` : The action creator to be dispatched when the subscription response contains no errors
  * `failure: function` : The action creator to be dispatched when the subscription response does contain errors

### `subscribe(id)`
- `id: string` : id of the subscription to unsubscribe
