import { SubscriptionClient } from 'subscriptions-transport-ws'

const SUBSCRIBE = 'redux-graphql-subscriptions/SUBSCRIBE'

export const subscribe = subscription => ({
  type: SUBSCRIBE,
  payload: subscription,
})

const UNSUBSCRIBE = 'redux-graphql-subscriptions/UNSUBSCRIBE'

export const unsubscribe = subscriptionName => ({
  type: UNSUBSCRIBE,
  payload: subscriptionName,
})

export default function createGraphQLSubscriptionsMiddleware(url, options) {
  const wsClient = new SubscriptionClient(url, options)

  return ({ dispatch }) => next => action => {
    if (action.type === SUBSCRIBE) {
      wsSubscribe(wsClient, dispatch, action.payload)
    }
    if (action.type === UNSUBSCRIBE) {
      wsUnsubscribe(wsClient, action.payload)
    }
    next(action)
  }
}

const wsSubscribe = (client, dispatch, { id, query, success, failure }) =>
  client.subscribe(
    { query },
    (error, res) =>
      error ? dispatch(failure(error)) : dispatch(success(res[id])),
  )

const wsUnsubscribe = (client, id) => client.unsubscribe(id)
