"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var subscriptions_transport_ws_1 = require("subscriptions-transport-ws");
var CONNECT = 'redux-graphql-subscriptions/CONNECT';
exports.connect = function (payload) { return ({
    type: CONNECT,
    payload: payload
}); };
var DISCONNECT = 'redux-graphql-subscriptions/DISCONNECT';
exports.disconnect = function () { return ({
    type: DISCONNECT
}); };
var SUBSCRIBE = 'redux-graphql-subscriptions/SUBSCRIBE';
exports.subscribe = function (subscription) { return ({
    type: SUBSCRIBE,
    payload: subscription
}); };
var UNSUBSCRIBE = 'redux-graphql-subscriptions/UNSUBSCRIBE';
exports.unsubscribe = function (key) { return ({
    type: UNSUBSCRIBE,
    payload: key
}); };
var ERROR = 'redux-graphql-subscriptions/ERROR';
exports.error = function (payload) { return ({
    type: ERROR,
    payload: payload,
    error: true
}); };
exports.WS_CLIENT_STATUS = {
    CLOSED: 3,
    CLOSING: 2,
    CONNECTING: 0,
    OPEN: 1
};
function createMiddleware() {
    var actionQueue = [], disconnectionTimeoutId, disconnectionWarningTimeoutId, unsubscriberMap = {}, wsClient = null;
    var handlerMap = {
        onConnected: null,
        onConnecting: null,
        onDisconnected: null,
        onDisconnectionTimeout: null,
        onError: null,
        onReconnected: null,
        onReconnecting: null
    };
    return function (_a) {
        var dispatch = _a.dispatch;
        return function (next) { return function (action) {
            if (action.type === CONNECT && !wsClient) {
                var _a = action.payload, options = _a.options, handlers = _a.handlers, url = _a.url, webSocketImpl = _a.webSocketImpl, webSocketProtocols = _a.webSocketProtocols, _b = _a.disconnectionTimeout, disconnectionTimeout = _b === void 0 ? 0 : _b;
                wsClient = new subscriptions_transport_ws_1.SubscriptionClient(url, options, webSocketImpl, webSocketProtocols);
                registerHandlers(handlers, disconnectionTimeout);
            }
            if (action.type === DISCONNECT && wsClient) {
                actionQueue = [];
                unsubscriberMap = {};
                deregisterHandlers();
                wsClient.close();
                wsClient = null;
            }
            if (action.type === SUBSCRIBE) {
                if (wsClient && wsClient.status === exports.WS_CLIENT_STATUS.OPEN) {
                    var payload = action.payload;
                    var key = payload.key, onUnsubscribe_1 = payload.onUnsubscribe, onSubscribing = payload.onSubscribing;
                    if (onSubscribing) {
                        dispatchActionOrArrayOfActions(onSubscribing());
                    }
                    if (!unsubscriberMap[key]) {
                        var unsubscribe_1 = wsSubscribe(wsClient, dispatch, payload).unsubscribe;
                        unsubscriberMap[key] = function () {
                            unsubscribe_1();
                            if (onUnsubscribe_1) {
                                dispatchActionOrArrayOfActions(onUnsubscribe_1());
                            }
                        };
                    }
                }
                else {
                    actionQueue.push(action);
                }
            }
            if (action.type === UNSUBSCRIBE && wsClient) {
                var key = action.payload;
                if (typeof unsubscriberMap[key] === 'function') {
                    unsubscriberMap[key]();
                    unsubscriberMap[key] = null;
                }
            }
            return next(action);
        }; };
        // Helpers
        function registerHandlers(handlers, disconnectionTimeout) {
            handlerMap.onConnected = wsClient.onConnected(function () {
                dispatchQueuedActions();
                if (handlers &&
                    typeof handlers.onConnected === 'function') {
                    dispatch(handlers.onConnected());
                }
            });
            if (handlers) {
                if (typeof handlers.onConnecting === 'function') {
                    handlerMap.onConnecting = wsClient.onConnecting(function () {
                        if (disconnectionTimeoutId) {
                            clearTimeout(disconnectionTimeoutId);
                            disconnectionTimeoutId = null;
                        }
                        dispatch(handlers.onConnecting());
                    });
                }
                if (typeof handlers.onDisconnected === 'function' || typeof handlers.onDisconnectionTimeout === 'function') {
                    handlerMap.onDisconnected = wsClient.onDisconnected(function () {
                        if (typeof handlers.onDisconnected === 'function') {
                            disconnectionWarningTimeoutId = setTimeout(function () { return dispatch(handlers.onDisconnected()); }, 1000);
                        }
                        if (typeof handlers.onDisconnectionTimeout ===
                            'function') {
                            if (!disconnectionTimeoutId) {
                                disconnectionTimeoutId = setTimeout(function () {
                                    return dispatch(handlers.onDisconnectionTimeout());
                                }, disconnectionTimeout);
                            }
                        }
                    });
                }
                if (typeof handlers.onError === 'function') {
                    handlerMap.onError = wsClient.onError(function () { return dispatch(handlers.onError()); });
                }
                if (typeof handlers.onReconnected === 'function') {
                    handlerMap.onReconnected = wsClient.onReconnected(function () {
                        if (disconnectionWarningTimeoutId) {
                            clearTimeout(disconnectionWarningTimeoutId);
                            disconnectionWarningTimeoutId = null;
                        }
                        if (disconnectionTimeoutId) {
                            clearTimeout(disconnectionTimeoutId);
                            disconnectionTimeoutId = null;
                        }
                        dispatch(handlers.onReconnected());
                    });
                }
                if (typeof handlers.onReconnecting === 'function') {
                    handlerMap.onReconnecting = wsClient.onReconnecting(function () { return dispatch(handlers.onReconnecting()); });
                }
            }
        }
        function deregisterHandlers() {
            Object.keys(handlerMap).forEach(function (handlerkey) {
                if (typeof handlerMap[handlerkey] === 'function') {
                    handlerMap[handlerkey]();
                    handlerMap[handlerkey] = null;
                }
            });
        }
        function dispatchQueuedActions() {
            var queueToDispatch = __spread(actionQueue);
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
        function wsSubscribe(client, dispatch, _a) {
            var query = _a.query, variables = _a.variables, onMessage = _a.onMessage, onError = _a.onError;
            return client.request({ query: query, variables: variables }).subscribe({
                next: function (res) {
                    if (res.errors) {
                        if (onError) {
                            dispatchActionOrArrayOfActions(onError(res.errors));
                        }
                        else {
                            dispatch(exports.error(res.errors));
                        }
                        return;
                    }
                    dispatchActionOrArrayOfActions(onMessage(res));
                }
            });
        }
    };
}
exports.createMiddleware = createMiddleware;
//# sourceMappingURL=index.js.map