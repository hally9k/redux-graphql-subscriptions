# redux-graphql-subscriptions

A Redux middleware for handling GraphQL subscriptions.

This repo leverages [subscriptions-transport-ws](https://github.com/apollographql/subscriptions-transport-ws) which is the awesome work of the Apollo guys [over here](https://github.com/apollographql) and is intended to be coupled with a backend server that also uses subscriptions-transport-ws.

## Getting Started

- Import the package `npm install --save redux-graphql-subscriptions`
- Instantiate the middleware, passing in the url of your websocket server. 
- Pass the middleware instance into your redux store.
```import { createStore, combineReducers, applyMiddleware } from 'redux'
import reducers from 'ducks'
import createGraphQLSubscriptionsMiddleware from 'redux-graphql-subscriptions'

const graphQLSubscriptionsMiddleware = createGraphQLSubscriptionsMiddleware('ws://localhost:8001/subscriptions')

let todoApp = combineReducers(reducers)
let store = createStore(
  todoApp,
  // applyMiddleware() tells createStore() how to handle middleware
  applyMiddleware(logger, graphQLSubscriptionsMiddleware)
)
```

## API

### `createGraphQLSubscriptionsMiddleware(url, options)`
- `url: string` : url that the client will connect to, starts with `ws://` or `wss://`
- `options?: Object` : optional, object to modify default client behavior
  * `timeout?: number` : how long the client should wait in ms for a keep-alive message from the server (default 10000 ms), this parameter is ignored if the server does not send keep-alive messages. This will also be used to calculate the max connection time per connect/reconnect
  * `lazy?: boolean` : use to set lazy mode - connects only when first subscription created, and delay the socket initialization
  * `connectionParams?: Object | Function` : object that will be available as first argument of `onConnect` (in server side), if passed a function - it will call it and send the return value
  * `reconnect?: boolean` : automatic reconnect in case of connection error
  * `reconnectionAttempts?: number` : how much reconnect attempts
  * `connectionCallback?: (error) => {}` : optional, callback that called after the first init message, with the error (if there is one)

### `subscribe(subscription)`
- `subscription: Object` : the required fields for a subscription
  * `id: string` : id to register the subscription under
  * `query: string` : GraphQL subscription
  * `variables?: Object` : GraphQL subscription variables
  * `success: function` : The action creator to be dispatched when the subscription response contains no errors
  * `failure: function` : The action creator to be dispatched when the subscription response does contain errors

### `subscribe(id)`
- `id: string` : id of the subscription to unsubscribe
