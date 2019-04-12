import {
    FSA as Action  } from '@vital-software/flux-standard-action'
import { ExecutionResult as GraphQLResponse, GraphQLError } from 'graphql'
import { SubscriptionClient, ClientOptions } from 'subscriptions-transport-ws-hally9k'
import { Store, Dispatch } from 'redux'

type FunctionMap = { [key: string]: Function | null }
type HandlerMap = { [key: string]: Function | null }

type WsClientStatusMap = {
    CLOSED: 3,
    CLOSING: 2,
    CONNECTING: 0,
    OPEN: 1
}

type ActionOrArrayOfActions = Action<any, any, any> | Array<Action<any, any, any>>

export type SubscriptionPayload = {
    key: string,
    onError?: (
        payload: readonly GraphQLError[]
    ) => ActionOrArrayOfActions,
    onMessage: (
        payload: GraphQLResponse
    ) => ActionOrArrayOfActions,
    onSubscribing?: () => ActionOrArrayOfActions,
    onUnsubscribe?: () => ActionOrArrayOfActions,
    query: string,
    variables?: {}
}

export type ConnectionPayload = {
    disconnectionTimeout?: number,
    handlers?: {
        onConnected?: () => ActionOrArrayOfActions,
        onConnecting?: () => ActionOrArrayOfActions,
        onDisconnected?: () => ActionOrArrayOfActions,
        onDisconnectionTimeout?: () =>
            | Action<any, any, any>
            | Array<Action<any, any, any>>,
        onError?: (errors?: any) => ActionOrArrayOfActions,
        onReconnected?: () => ActionOrArrayOfActions,
        onReconnecting?: () => ActionOrArrayOfActions
    },
    options: ClientOptions,
    protocols?: string | Array<string>,
    url: string
}


const CONNECT = 'redux-graphql-subscriptions/CONNECT'
type ConnectAction = Action<typeof CONNECT, ConnectionPayload>

export const connect = (payload: ConnectionPayload): ConnectAction => ({
    type: CONNECT,
    payload
})

const DISCONNECT = 'redux-graphql-subscriptions/DISCONNECT'
type DisconnectAction = Action<typeof DISCONNECT>

export const disconnect = (): DisconnectAction => ({
    type: DISCONNECT
})

const SUBSCRIBE = 'redux-graphql-subscriptions/SUBSCRIBE'
export type SubscribeAction = Action<typeof SUBSCRIBE, SubscriptionPayload>
export type SubscribeActionCreator = (subscription: SubscriptionPayload) => SubscribeAction

export const subscribe: SubscribeActionCreator = (
    subscription
) => ({
    type: SUBSCRIBE,
    payload: subscription
})

const UNSUBSCRIBE = 'redux-graphql-subscriptions/UNSUBSCRIBE'
export type UnsubscribeAction = Action<typeof UNSUBSCRIBE, string>
export type UnubscribeActionCreator = (key: string) => UnsubscribeAction

export const unsubscribe: UnubscribeActionCreator = (key): UnsubscribeAction => ({
    type: UNSUBSCRIBE,
    payload: key
})

const ERROR = 'redux-graphql-subscriptions/ERROR'
type ErrorAction = Action<typeof ERROR, readonly GraphQLError[]>


export const error = (
    payload: readonly GraphQLError[]
    ): ErrorAction  => ({
        type: ERROR,
        payload,
        error: true
    })
    
export type ReduxGraphQLSubscriptionActionUnion = ConnectAction | DisconnectAction | SubscribeAction | UnsubscribeAction | ErrorAction

export const WS_CLIENT_STATUS: WsClientStatusMap = {
    CLOSED: 3,
    CLOSING: 2,
    CONNECTING: 0,
    OPEN: 1
}

export function createMiddleware<S>() {
    let actionQueue: Array<ReduxGraphQLSubscriptionActionUnion> = [],
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
        return (next: Dispatch<Action<any, any, any>>) => (action: ReduxGraphQLSubscriptionActionUnion) => {
            const { type } = action

            if (type === CONNECT && !wsClient) {
                const {
                    options,
                    handlers,
                    url,
                    protocols,
                    disconnectionTimeout = 0
                }: ConnectionPayload = action.payload as ConnectionPayload // FIXME: Can't work out why this can't discriminate between the types

                wsClient = new SubscriptionClient(url, options, null, protocols)
                registerHandlers(handlers, disconnectionTimeout)
                
            }
            if (type === DISCONNECT && wsClient) {
                actionQueue = []
                unsubscriberMap = {}
                deregisterHandlers()
                wsClient.close()
                wsClient = null
            }
            if (type === SUBSCRIBE) {
                if (wsClient && wsClient.status === WS_CLIENT_STATUS.OPEN) {
                    const payload: SubscriptionPayload = action.payload as SubscriptionPayload // FIXME: Can't work out why this can't discriminate between the types
                    const {
                        key,
                        onUnsubscribe,
                        onSubscribing
                    }: SubscriptionPayload = payload

                    if (onSubscribing) {
                        dispatchActionOrArrayOfActions(onSubscribing())
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
                                dispatchActionOrArrayOfActions(onUnsubscribe())
                            }
                        }
                    }
                } else {
                    actionQueue.push(action)
                }
            }
            if (type === UNSUBSCRIBE && wsClient) {
                const key: string = action.payload as string // FIXME: Can't work out why this can't discriminate between the types

                if (typeof unsubscriberMap[key] === 'function') {
                    unsubscriberMap[key]()
                    unsubscriberMap[key] = null
                }
            }

            return next(action)
        }
        
        // Helpers
        function registerHandlers(handlers: HandlerMap, disconnectionTimeout: number) {
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

        function deregisterHandlers() {
            Object.keys(handlerMap).forEach(handlerkey => {
                if (typeof handlerMap[handlerkey] === 'function') {
                    handlerMap[handlerkey]()
                    handlerMap[handlerkey] = null
                }
            })
        }

        function dispatchQueuedActions() {
            const queueToDispatch: Array<ReduxGraphQLSubscriptionActionUnion> = [
                ...actionQueue
            ]

            actionQueue = []
            queueToDispatch.forEach(dispatch)
        }

        function dispatchActionOrArrayOfActions(actions: ActionOrArrayOfActions) {
            if(Array.isArray(actions)) {
                actions.forEach(dispatch)
            } else {
                dispatch(actions)
            }
        }

        function wsSubscribe(
            client: SubscriptionClient,
            dispatch: Dispatch<Action<any, any, any>>,
            { query, variables, onMessage, onError }: SubscriptionPayload
        ) {
            return client.request({ query, variables }).subscribe({
                next: (res: GraphQLResponse) => {
                    if (res.errors) {
                        if(onError) {
                            dispatchActionOrArrayOfActions(onError(res.errors))
                        }

                        dispatch(error(res.errors))

                        return
                    }


                    dispatchActionOrArrayOfActions(onMessage(res))
                }
            })
        }
    }
}






