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

const refs = {}

export default function createGraphQLSubscriptionsMiddleware(url, options) {
  const wsClient = new SubscriptionClient(url, options)

  return ({ dispatch }) => next => action => {
    const { type } = action

    if (type === SUBSCRIBE) {
      const { payload: { variables: { channel } } } = action
      refs[channel] ? refs[channel]++ : (refs[channel] = 1)
      console.log(refs)
      wsSubscribe(wsClient, dispatch, action.payload)
    }
    if (type === UNSUBSCRIBE) {
      const { payload: { variables: { channel } } } = action
      refs[channel] >= 1 ? refs[channel]-- : (refs[channel] = null)
      if (refs[channel] <= 0) {
        wsUnsubscribe(wsClient, action.payload)
      }
    }
    next(action)
  }
}

const wsSubscribe = (
  client,
  dispatch,
  { query, variables, success, failure },
) =>
  client.subscribe(
    { query, variables },
    (error, res) =>
      error ? dispatch(failure(error)) : dispatch(success(res[channel])),
  )

const wsUnsubscribe = (client, channel) => client.unsubscribe(channel)
