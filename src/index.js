// @flow
import { SubscriptionClient } from 'subscriptions-transport-ws-hally9k'
import { type SubscriptionPayload } from './index.js.flow'

const CONNECT: string = 'redux-graphql-subscriptions/CONNECT'

export const connect: * = (): ReduxAction<*> => ({
    type: CONNECT
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

export const WS_CLIENT_STATUS: * = {
    CLOSED: 3,
    CLOSING: 2,
    CONNECTING: 0,
    OPEN: 1
}

export function createMiddleware(url: string, options: *): * {
    let actionQueue: Array<ReduxAction<SubscriptionPayload>> = [],
        wsClient: SubscriptionClient | null = null
    const unsubscriberMap: { [string]: (() => void) | null } = {}

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
                wsClient = new SubscriptionClient(url, options)

                wsClient.onConnected(() => {
                    dispatchQueuedActions()
                })
            }
            if (type === DISCONNECT && wsClient) {
                wsClient.close()
                wsClient = null
            }
            if (type === SUBSCRIBE && wsClient) {
                if (wsClient.status === WS_CLIENT_STATUS.OPEN) {
                    const payload: SubscriptionPayload = (action.payload: any)
                    const { key, onUnsubscribe }: SubscriptionPayload = payload

                    if (!unsubscriberMap[key]) {
                        const { unsubscribe }: * = wsSubscribe(
                            wsClient,
                            dispatch,
                            payload
                        )

                        unsubscriberMap[key] = () => {
                            unsubscribe()
                            dispatch(onUnsubscribe(key))
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
            return res.error
                ? dispatch(onError(res.error))
                : dispatch(onMessage(res))
        }
    })
}
