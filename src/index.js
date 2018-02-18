import { SubscriptionClient } from 'subscriptions-transport-ws'

const SUBSCRIBE = 'redux-graphql-subscriptions/SUBSCRIBE'

export const subscribe = subscription => ({
  type: SUBSCRIBE,
  payload: subscription,
})

const UNSUBSCRIBE = 'redux-graphql-subscriptions/UNSUBSCRIBE'

export const unsubscribe = channel => ({
  type: UNSUBSCRIBE,
  payload: channel,
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
      const { payload: channel } = action
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
) => {
  const obs = client.request({ query, variables })
  obs.subscribe(
    // next, error, complete
    res => {
      dispatch(success(res))
    },
    error => {
      dispatch(failure(error))
    },
  )
}

const wsUnsubscribe = (client, channel) => client.unsubscribe(channel)
