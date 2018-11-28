# redux-graphql-subscriptions

A Redux middleware for handling GraphQL subscriptions.

This repo leverages [subscriptions-transport-ws](https://github.com/apollographql/subscriptions-transport-ws) which is the awesome work of the Apollo guys [over here](https://github.com/apollographql) and is intended to be coupled with a backend server that also uses subscriptions-transport-ws or conforms to the [same protocol](https://github.com/apollographql/subscriptions-transport-ws/blob/master/PROTOCOL.md).

This is totally work in progress so all comment, critique and help welcomed!

## Getting Started

- Import the package `yarn add redux-graphql-subscriptions`
- Instantiate the middleware, passing in the url of your websocket server.
- Pass the middleware instance into your redux store.

```
import { createStore, combineReducers, applyMiddleware } from 'redux'
import reducers from 'reducers'
import { createMiddleware } from 'redux-graphql-subscriptions'

const graphQLSubscriptionsMiddleware = createMiddleware('ws://localhost:8001/subscriptions', { reconnect: true })

let todoApp = combineReducers(reducers)
let store = createStore(
  todoApp,
  applyMiddleware(logger, graphQLSubscriptionsMiddleware)
)
```

- Import the subscribe and unsubscribe functions and use them in action creators.

```
import { subscribe, unsubscribe } from 'redux-graphql-subscriptions'

export const subscribeToNewComments = () => subscribe({ ...newComment, { channel: 'one' } })
export const unsubscribeFromNewComments = () => unsubscribe('one')

// Subscription object
const newComment = {
    query: newCommentSubscription,
    onMessage: receivedNewComment,
    onError: receivedNewCommentWithErrors,
    onUnsubscribe: threadClosed
}
```

## Working Example

Clone the repo and boot up the working example to see how to integrate it into your app:

- `git clone git@github.com:hally9k/redux-graphql-subscriptions.git`

Run the server:

- `cd example/server`
- `yarn`
- `yarn start`
- `cd ../..` _(Back to the root for the next step)_

Run the client:

- `yarn`
- `yarn link`
- `cd example/client`
- `yarn`
- `yarn link "redux-graphql-subscriptions"`
- `yarn start`

Once you have the app running make a subscription and test the automatic reconnections by killing and standing up the server.

## API

### `createMiddleware(url, options)`

- `url: string` : url that the client will connect to, starts with `ws://` or `wss://`
- `options?: Object` : optional, object to modify default client behavior
  - `timeout?: number` : how long the client should wait in ms for a keep-alive message from the server (default 10000 ms), this parameter is ignored if the server does not send keep-alive messages. This will also be used to calculate the max connection time per connect/reconnect
  - `lazy?: boolean` : use to set lazy mode - connects only when first subscription created, and delay the socket initialization
  - `connectionParams?: Object | Function` : object that will be available as first argument of `onConnect` (in server side), if passed a function - it will call it and send the return value
  - `reconnect?: boolean` : automatic reconnect in case of connection error
  - `reconnectionAttempts?: number` : how many reconnect attempts
  - `connectionCallback?: (error) => {}` : optional, callback that called after the first init message, with the error (if there is one)

### `subscribe(subscription)`

- `subscription: Object` : the required fields for a subscription
  - `query: string` : GraphQL subscription
  - `variables?: Object` : GraphQL subscription variables, requires `channel` value to be set to denote the channel to listen to.
  - `onMessage: function` : The action creator to be dispatched when a message is received without any errors
  - `onError: function` : The action creator to be dispatched when a message is received that does contain errors
  - `onUnsubscribe: function` : The action creator to be dispatched when the client unsubscribes form a subscription

### `unsubscribe(channel)`

- `channel: string` : channel to unsubscribe from
