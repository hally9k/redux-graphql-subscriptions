// @flow
import type {
    ConnectionPayload,
    SubscriptionPayload,
    WsClientStatusMap
} from './index.js.flow'
import { SubscriptionClient } from 'subscriptions-transport-ws-hally9k'
type HandlerKey =
    | 'onConnected'
    | 'onConnecting'
    | 'onDisconnected'
    | 'onError'
    | 'onReconnected'
    | 'onReconnecting'

type FunctionMap = { [string]: (() => void) | null }
type HandlerMap = { [HandlerKey]: (() => void) | null }

const CONNECT: string = 'redux-graphql-subscriptions/CONNECT'

export const connect: * = (payload: *): ReduxAction<*> => ({
    type: CONNECT,
    payload
})

const DISCONNECT: string = 'redux-graphql-subscriptions/DISCONNECT'

export const disconnect: * = (): ReduxAction<*> => ({
    type: DISCONNECT
})

const SUBSCRIBE: string = 'redux-graphql-subscriptions/SUBSCRIBE'

export const subscribe: * = (
    subscription: SubscriptionPayload
): ReduxAction<SubscriptionPayload> => ({
    type: SUBSCRIBE,
    payload: subscription
})

const UNSUBSCRIBE: string = 'redux-graphql-subscriptions/UNSUBSCRIBE'

export const unsubscribe: * = (key: string): ReduxAction<string> => ({
    type: UNSUBSCRIBE,
    payload: key
})

const ERROR: string = 'redux-graphql-subscriptions/ERROR'

export const error: * = (
    payload: Array<GraphQLError>
): ReduxAction<Array<GraphQLError>> => ({
    type: ERROR,
    payload,
    error: true
})

export const WS_CLIENT_STATUS: WsClientStatusMap = {
    CLOSED: 3,
    CLOSING: 2,
    CONNECTING: 0,
    OPEN: 1
}

export function createMiddleware(): * {
    let actionQueue: Array<ReduxAction<SubscriptionPayload>> = [],
        unsubscriberMap: FunctionMap = {},
        wsClient: SubscriptionClient | null = null

    const handlerMap: HandlerMap = {
        onConnected: null,
        onConnecting: null,
        onDisconnected: null,
        onError: null,
        onReconnected: null,
        onReconnecting: null
    }

    return ({ dispatch }: *): * => {
        function dispatchQueuedActions() {
            const queueToDispatch: Array<ReduxAction<SubscriptionPayload>> = [
                ...actionQueue
            ]

            actionQueue = []
            queueToDispatch.forEach(dispatch)
        }

        return (next: *): * => (action: *): * => {
            const { type }: * = action

            if (type === CONNECT && !wsClient) {
                const {
                    options,
                    handlers,
                    url,
                    protocols
                }: ConnectionPayload = (action.payload: any)

                wsClient = new SubscriptionClient(url, options, null, protocols)

                handlerMap.onConnected = wsClient.onConnected(() => {
                    dispatchQueuedActions()
                    if (handlers && handlers.onConnected) {
                        handlers.onConnected()
                    }
                })
                if (handlers) {
                    if (handlers.onConnecting) {
                        handlerMap.onConnecting = wsClient.onConnecting(
                            handlers.onConnecting
                        )
                    }

                    if (handlers.onDisconnected) {
                        handlerMap.onDisconnected = wsClient.onDisconnected(
                            handlers.onDisconnected
                        )
                    }

                    if (handlers.onError) {
                        handlerMap.onError = wsClient.onError(handlers.onError)
                    }

                    if (handlers.onReconnected) {
                        handlerMap.onReconnected = wsClient.onReconnected(
                            handlers.onReconnected
                        )
                    }

                    if (handlers.onReconnecting) {
                        handlerMap.onReconnecting = wsClient.onReconnecting(
                            handlers.onReconnecting
                        )
                    }
                }
            }
            if (type === DISCONNECT && wsClient) {
                actionQueue = []
                unsubscriberMap = {}
                deregisterHandlers(handlerMap)
                wsClient.close()
                wsClient = null
            }
            if (type === SUBSCRIBE && wsClient) {
                if (wsClient.status === WS_CLIENT_STATUS.OPEN) {
                    const payload: SubscriptionPayload = (action.payload: any)
                    const {
                        key,
                        onUnsubscribe,
                        onSubscribing
                    }: SubscriptionPayload = payload

                    if (onSubscribing) {
                        dispatch(onSubscribing())
                    }

                    if (!unsubscriberMap[key]) {
                        const { unsubscribe }: * = wsSubscribe(
                            wsClient,
                            dispatch,
                            payload
                        )

                        unsubscriberMap[key] = () => {
                            unsubscribe()
                            if (onUnsubscribe) {
                                dispatch(onUnsubscribe(key))
                            }
                        }
                    }
                } else {
                    actionQueue.push(action)
                }
            }
            if (type === UNSUBSCRIBE && wsClient) {
                const key: string = (action.payload: any)

                if (typeof unsubscriberMap[key] === 'function') {
                    (unsubscriberMap[key]: any)() // Flow struggles with this being narrowed to a function...
                    unsubscriberMap[key] = null
                }
            }

            return next(action)
        }
    }
}

const wsSubscribe: * = (
    client: *,
    dispatch: *,
    { query, variables, onMessage, onError }: SubscriptionPayload
): * => {
    return client.request({ query, variables }).subscribe({
        next: (res: GraphQLResponse): * => {
            if (res.errors) {
                return dispatch(
                    onError ? onError(res.errors) : error(res.errors)
                )
            }

            return dispatch(onMessage(res))
        }
    })
}

function deregisterHandlers(handlerMap: HandlerMap) {
    Object.keys(handlerMap).forEach((handlerkey: HandlerKey) => {
        if (typeof handlerMap[handlerkey] === 'function') {
            (handlerMap[handlerkey]: any)() // Flow struggles with this being narrowed to a function...
            handlerMap[handlerkey] = null
        }
    })
}
