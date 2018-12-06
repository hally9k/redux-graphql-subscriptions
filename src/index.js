// @flow
import { SubscriptionClient } from 'subscriptions-transport-ws-hally9k'
import { type SubscriptionPayload } from './index.js.flow'

const SUBSCRIBE: string = 'redux-graphql-subscriptions/SUBSCRIBE'

export const subscribe: * = (
    subscription: SubscriptionPayload
): ReduxAction<SubscriptionPayload> => ({
    type: SUBSCRIBE,
    payload: subscription
})

const UNSUBSCRIBE: string = 'redux-graphql-subscriptions/UNSUBSCRIBE'

export const unsubscribe: * = (
    subscriptionName: string
): ReduxAction<string> => ({
    type: UNSUBSCRIBE,
    payload: subscriptionName
})

export function createMiddleware(
    url: string,
    options: *,
    protocols?: string | Array<string>
): * {
    const wsClient: SubscriptionClient = new SubscriptionClient(
        url,
        options,
        null,
        protocols
    )
    const currentSubscriptions: { [string]: (() => void) | null } = {}

    return ({ dispatch }: *): * => (next: *): * => (action: *): * => {
        const { type }: * = action

        if (type === SUBSCRIBE) {
            const payload: SubscriptionPayload = (action.payload: any)
            const {
                variables: { channel },
                onUnsubscribe
            }: SubscriptionPayload = payload

            if (!currentSubscriptions[channel]) {
                const { unsubscribe }: * = wsSubscribe(
                    wsClient,
                    dispatch,
                    payload
                )

                currentSubscriptions[channel] = () => {
                    unsubscribe()
                    dispatch(onUnsubscribe(channel))
                }
            }
        }
        if (type === UNSUBSCRIBE) {
            const channel: string = (action.payload: any)

            if (typeof currentSubscriptions[channel] === 'function') {
                (currentSubscriptions[channel]: any)() // Flow struggles with this being narrowed to a function...
                currentSubscriptions[channel] = null
            }
        }

        return next(action)
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
