import { FluxStandardAction as Action } from 'flux-standard-action'
import { ExecutionResult as GraphQLResponse, GraphQLError } from 'graphql'
import { SubscriptionClient } from 'subscriptions-transport-ws-hally9k'
import { Store, Dispatch } from 'redux'

type FunctionMap = { [key: string]: Function | null }
type HandlerMap = { [key: string]: Function | null }

type WsClientStatusMap = {
    CLOSED: 3,
    CLOSING: 2,
    CONNECTING: 0,
    OPEN: 1
}

export type SubscriptionPayload = {
    key: string,
    onError?: (
        payload: readonly GraphQLError[]
    ) => Action<any> & Array<Action<any>>,
    onMessage: (
        payload: GraphQLResponse
    ) => Action<any> & Array<Action<any>>,
    onSubscribing?: () => Action<any> & Array<Action<any>>,
    onUnsubscribe?: () => Action<any> & Array<Action<any>>,
    query: string,
    variables?: {}
}

export type ConnectionPayload = {
    disconnectionTimeout?: number,
    handlers?: {
        onConnected?: () => Action<any> & Array<Action<any>>,
        onConnecting?: () => Action<any> & Array<Action<any>>,
        onDisconnected?: () => Action<any> & Array<Action<any>>,
        onDisconnectionTimeout?: () =>
            & Action<any>
            & Array<Action<any>>,
        onError?: (errors?: any) => Action<any> & Array<Action<any>>,
        onReconnected?: () => Action<any> & Array<Action<any>>,
        onReconnecting?: () => Action<any> & Array<Action<any>>
    },
    options: {
        connectionCallback?: any, //(?Error) => void,
        connectionOptions?: {},
        reconnect?: boolean
    },
    protocols?: string | Array<string>,
    url: string
}


const CONNECT: string = 'redux-graphql-subscriptions/CONNECT'

export const connect = (payload: ConnectionPayload): Action<ConnectionPayload> => ({
    type: CONNECT,
    payload
})

const DISCONNECT: string = 'redux-graphql-subscriptions/DISCONNECT'

export const disconnect = (): Action<any> => ({
    type: DISCONNECT
})

const SUBSCRIBE: string = 'redux-graphql-subscriptions/SUBSCRIBE'

export const subscribe = (
    subscription: SubscriptionPayload
): Action<SubscriptionPayload> => ({
    type: SUBSCRIBE,
    payload: subscription
})

const UNSUBSCRIBE: string = 'redux-graphql-subscriptions/UNSUBSCRIBE'

export const unsubscribe = (key: string): Action<string> => ({
    type: UNSUBSCRIBE,
    payload: key
})

const ERROR: string = 'redux-graphql-subscriptions/ERROR'

export const error = (
    payload: readonly GraphQLError[]
): Action<readonly GraphQLError[]> => ({
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

export function createMiddleware<S>() {
    let actionQueue: Array<Action<SubscriptionPayload>> = [],
        disconnectionTimeoutId: NodeJS.Timeout | null,
        unsubscriberMap: FunctionMap = {},
        wsClient: SubscriptionClient | null = null

    const handlerMap: HandlerMap = {
        onConnected: null,
        onConnecting: null,
        onDisconnected: null,
        onDisconnectionTimeout: null,
        onError: null,
        onReconnected: null,
        onReconnecting: null
    }

    return ({ dispatch }: Store<S>) => {
        function dispatchQueuedActions() {
            const queueToDispatch: Array<Action<SubscriptionPayload>> = [
                ...actionQueue
            ]

            actionQueue = []
            queueToDispatch.forEach(dispatch)
        }

        return (next: Dispatch<Action<any>>) => (action: Action<any>) => {
            const { type } = action

            if (type === CONNECT && !wsClient) {
                const {
                    options,
                    handlers,
                    url,
                    protocols,
                    disconnectionTimeout = 0
                }: ConnectionPayload = action.payload

                wsClient = new SubscriptionClient(url, options, null, protocols)

                handlerMap.onConnected = wsClient.onConnected(() => {
                    dispatchQueuedActions()
                    if (
                        handlers &&
                        typeof handlers.onConnected === 'function'
                    ) {
                        dispatch(handlers.onConnected())
                    }
                })
                if (handlers) {
                    if (typeof handlers.onConnecting === 'function') {
                        handlerMap.onConnecting = wsClient.onConnecting(
                            () => {
                                if (disconnectionTimeoutId) {
                                    clearTimeout(disconnectionTimeoutId)
                                    disconnectionTimeoutId = null
                                }

                                dispatch(handlers.onConnecting())
                            }
                        )
                    }

                    if (typeof handlers.onDisconnected === 'function') {
                        handlerMap.onDisconnected = wsClient.onDisconnected(
                            () => {
                                dispatch(handlers.onDisconnected())

                                if (
                                    typeof handlers.onDisconnectionTimeout ===
                                    'function'
                                ) {
                                    if (!disconnectionTimeoutId) {
                                        disconnectionTimeoutId = setTimeout(
                                            () =>
                                                dispatch(
                                                    handlers.onDisconnectionTimeout()
                                                ),
                                            disconnectionTimeout
                                        )
                                    }
                                }
                            }
                        )
                    }

                    if (typeof handlers.onError === 'function') {
                        handlerMap.onError = wsClient.onError(
                            () => dispatch(handlers.onError())
                        )
                    }

                    if (typeof handlers.onReconnected === 'function') {
                        handlerMap.onReconnected = wsClient.onReconnected(
                            () => {
                                if (disconnectionTimeoutId) {
                                    clearTimeout(disconnectionTimeoutId)
                                    disconnectionTimeoutId = null
                                }
                                dispatch(handlers.onReconnected())
                            }
                        )
                    }

                    if (typeof handlers.onReconnecting === 'function') {
                        handlerMap.onReconnecting = wsClient.onReconnecting(
                            () => dispatch(handlers.onReconnecting())
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
            if (type === SUBSCRIBE) {
                if (wsClient && wsClient.status === WS_CLIENT_STATUS.OPEN) {
                    const payload: SubscriptionPayload = action.payload
                    const {
                        key,
                        onUnsubscribe,
                        onSubscribing
                    }: SubscriptionPayload = payload

                    if (onSubscribing) {
                        dispatch(onSubscribing())
                    }

                    if (!unsubscriberMap[key]) {
                        const { unsubscribe } = wsSubscribe(
                            wsClient,
                            dispatch,
                            payload
                        )

                        unsubscriberMap[key] = () => {
                            unsubscribe()
                            if (onUnsubscribe) {
                                dispatch(onUnsubscribe())
                            }
                        }
                    }
                } else {
                    actionQueue.push(action)
                }
            }
            if (type === UNSUBSCRIBE && wsClient) {
                const key: string = action.payload

                if (typeof unsubscriberMap[key] === 'function') {
                    unsubscriberMap[key]()
                    unsubscriberMap[key] = null
                }
            }

            return next(action)
        }
    }
}

const wsSubscribe = (
    client: SubscriptionClient,
    dispatch: Dispatch<Action<any>>,
    { query, variables, onMessage, onError }: SubscriptionPayload
) => {
    return client.request({ query, variables }).subscribe({
        next: (res: GraphQLResponse) => {
            if (res.errors) {
                return dispatch(onError ? onError(res.errors) : error(res.errors))
            }

            return dispatch(onMessage(res))
        }
    })
}

function deregisterHandlers(handlerMap: HandlerMap) {
    Object.keys(handlerMap).forEach(handlerkey => {
        if (typeof handlerMap[handlerkey] === 'function') {
            handlerMap[handlerkey]()
            handlerMap[handlerkey] = null
        }
    })
}
