import { SubscriptionClient } from 'subscriptions-transport-ws';
const CONNECT = 'redux-graphql-subscriptions/CONNECT';
export const connect = (payload) => ({
    type: CONNECT,
    payload
});
const DISCONNECT = 'redux-graphql-subscriptions/DISCONNECT';
export const disconnect = () => ({
    type: DISCONNECT
});
const SUBSCRIBE = 'redux-graphql-subscriptions/SUBSCRIBE';
export const subscribe = (subscription) => ({
    type: SUBSCRIBE,
    payload: subscription
});
const UNSUBSCRIBE = 'redux-graphql-subscriptions/UNSUBSCRIBE';
export const unsubscribe = (key) => ({
    type: UNSUBSCRIBE,
    payload: key
});
const ERROR = 'redux-graphql-subscriptions/ERROR';
export const error = (payload) => ({
    type: ERROR,
    payload,
    error: true
});
export const WS_CLIENT_STATUS = {
    CLOSED: 3,
    CLOSING: 2,
    CONNECTING: 0,
    OPEN: 1
};
export function createMiddleware() {
    let actionQueue = [], disconnectionTimeoutId, unsubscriberMap = {}, wsClient = null;
    const handlerMap = {
        onConnected: null,
        onConnecting: null,
        onDisconnected: null,
        onDisconnectionTimeout: null,
        onError: null,
        onReconnected: null,
        onReconnecting: null
    };
    return ({ dispatch }) => {
        return (next) => (action) => {
            const { type } = action;
            if (type === CONNECT && !wsClient) {
                const { options, handlers, url, protocols, disconnectionTimeout = 0 } = action.payload; // FIXME: Can't work out why this can't discriminate between the types
                wsClient = new SubscriptionClient(url, options, null, protocols);
                registerHandlers(handlers, disconnectionTimeout);
            }
            if (type === DISCONNECT && wsClient) {
                actionQueue = [];
                unsubscriberMap = {};
                deregisterHandlers();
                wsClient.close();
                wsClient = null;
            }
            if (type === SUBSCRIBE) {
                if (wsClient && wsClient.status === WS_CLIENT_STATUS.OPEN) {
                    const payload = action.payload; // FIXME: Can't work out why this can't discriminate between the types
                    const { key, onUnsubscribe, onSubscribing } = payload;
                    if (onSubscribing) {
                        dispatchActionOrArrayOfActions(onSubscribing());
                    }
                    if (!unsubscriberMap[key]) {
                        const { unsubscribe } = wsSubscribe(wsClient, dispatch, payload);
                        unsubscriberMap[key] = () => {
                            unsubscribe();
                            if (onUnsubscribe) {
                                dispatchActionOrArrayOfActions(onUnsubscribe());
                            }
                        };
                    }
                }
                else {
                    actionQueue.push(action);
                }
            }
            if (type === UNSUBSCRIBE && wsClient) {
                const key = action.payload; // FIXME: Can't work out why this can't discriminate between the types
                if (typeof unsubscriberMap[key] === 'function') {
                    unsubscriberMap[key]();
                    unsubscriberMap[key] = null;
                }
            }
            return next(action);
        };
        // Helpers
        function registerHandlers(handlers, disconnectionTimeout) {
            handlerMap.onConnected = wsClient.onConnected(() => {
                dispatchQueuedActions();
                if (handlers &&
                    typeof handlers.onConnected === 'function') {
                    dispatch(handlers.onConnected());
                }
            });
            if (handlers) {
                if (typeof handlers.onConnecting === 'function') {
                    handlerMap.onConnecting = wsClient.onConnecting(() => {
                        if (disconnectionTimeoutId) {
                            clearTimeout(disconnectionTimeoutId);
                            disconnectionTimeoutId = null;
                        }
                        dispatch(handlers.onConnecting());
                    });
                }
                if (typeof handlers.onDisconnected === 'function') {
                    handlerMap.onDisconnected = wsClient.onDisconnected(() => {
                        dispatch(handlers.onDisconnected());
                        if (typeof handlers.onDisconnectionTimeout ===
                            'function') {
                            if (!disconnectionTimeoutId) {
                                disconnectionTimeoutId = setTimeout(() => dispatch(handlers.onDisconnectionTimeout()), disconnectionTimeout);
                            }
                        }
                    });
                }
                if (typeof handlers.onError === 'function') {
                    handlerMap.onError = wsClient.onError(() => dispatch(handlers.onError()));
                }
                if (typeof handlers.onReconnected === 'function') {
                    handlerMap.onReconnected = wsClient.onReconnected(() => {
                        if (disconnectionTimeoutId) {
                            clearTimeout(disconnectionTimeoutId);
                            disconnectionTimeoutId = null;
                        }
                        dispatch(handlers.onReconnected());
                    });
                }
                if (typeof handlers.onReconnecting === 'function') {
                    handlerMap.onReconnecting = wsClient.onReconnecting(() => dispatch(handlers.onReconnecting()));
                }
            }
        }
        function deregisterHandlers() {
            Object.keys(handlerMap).forEach(handlerkey => {
                if (typeof handlerMap[handlerkey] === 'function') {
                    handlerMap[handlerkey]();
                    handlerMap[handlerkey] = null;
                }
            });
        }
        function dispatchQueuedActions() {
            const queueToDispatch = [
                ...actionQueue
            ];
            actionQueue = [];
            queueToDispatch.forEach(dispatch);
        }
        function dispatchActionOrArrayOfActions(actions) {
            if (Array.isArray(actions)) {
                actions.forEach(dispatch);
            }
            else {
                dispatch(actions);
            }
        }
        function wsSubscribe(client, dispatch, { query, variables, onMessage, onError }) {
            return client.request({ query, variables }).subscribe({
                next: (res) => {
                    if (res.errors) {
                        if (onError) {
                            dispatchActionOrArrayOfActions(onError(res.errors));
                        }
                        dispatch(error(res.errors));
                        return;
                    }
                    dispatchActionOrArrayOfActions(onMessage(res));
                }
            });
        }
    };
}
//# sourceMappingURL=index.js.map