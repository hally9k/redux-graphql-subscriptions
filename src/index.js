// @flow
import { SubscriptionClient } from "subscriptions-transport-ws";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
export type SubscriptionPayload = {
  query: GraphQLAST,
  variables: {},
  success: ReduxAction<*>,
  failure: ReduxAction<*>
};

const SUBSCRIBE = "redux-graphql-subscriptions/SUBSCRIBE";

export const subscribe: * = (subscription: *): ReduxAction<*> => ({
  type: SUBSCRIBE,
  payload: subscription
});

const UNSUBSCRIBE = "redux-graphql-subscriptions/UNSUBSCRIBE";

export const unsubscribe: * = (
  subscriptionName: string
): ReduxAction<string> => ({
  type: UNSUBSCRIBE,
  payload: subscriptionName
});

const refs = {};

const unsubscribeFns = {};

export default function createGraphQLSubscriptionsMiddleware<AppState>(
  url: string,
  options: *
): ReduxMiddleware<AppState, ReduxAction<*>, ReduxAction<*>> {
  const wsClient = new SubscriptionClient(url, options);

  return ({ dispatch }) => next => action => {
    const { type } = action;

    if (type === SUBSCRIBE) {
      const {
        payload: {
          variables: { channel }
        }
      } = action;

      const { unsubscribe } = wsSubscribe(wsClient, dispatch, action.payload);
      unsubscribeFns[channel] = unsubscribe;
    }
    if (type === UNSUBSCRIBE) {
      const { payload: channel } = action;

      if (unsubscribeFns[channel]) {
        unsubscribeFns[channel]();
      }
    }
    return next(action);
  };
}

const wsSubscribe = (
  client,
  dispatch,
  { query, variables, success, failure }
) => {
  return client.request({ query, variables }).subscribe({
    next: res =>
      res.error ? dispatch(failure(res.error)) : dispatch(success(res))
  });
};
