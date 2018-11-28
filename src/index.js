// @flow
import { SubscriptionClient } from "subscriptions-transport-ws";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { type SubscriptionPayload } from "./";

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

const currentSubscriptions = {};

export default function createGraphQLSubscriptionsMiddleware<AppState>(
  url: string,
  options: *
): ReduxMiddleware<AppState, ReduxAction<*>, ReduxAction<*>> {
  const wsClient = new SubscriptionClient(url, options);

  return ({ dispatch }) => next => action => {
    const { type } = action;
    if (type === SUBSCRIBE) {
      const payload: SubscriptionPayload = (action.payload: any);
      const {
        variables: { channel },
        onUnsubscribe
      } = payload;

      if (!currentSubscriptions[channel]) {
        const { unsubscribe } = wsSubscribe(wsClient, dispatch, payload);
        currentSubscriptions[channel] = () => {
          unsubscribe();
          dispatch(onUnsubscribe());
        };
      }
    }
    if (type === UNSUBSCRIBE) {
      const channel: string = (action.payload: any);

      if (currentSubscriptions[channel]) {
        currentSubscriptions[channel]();
        currentSubscriptions[channel] = null;
      }
    }
    return next(action);
  };
}

const wsSubscribe = (
  client,
  dispatch,
  { query, variables, onMessage, onError }
) => {
  return client.request({ query, variables }).subscribe({
    next: res =>
      res.error ? dispatch(onError(res.error)) : dispatch(onMessage(res))
  });
};
