// @flow
import type { ComponentType } from 'react'
import { connect } from 'react-redux'
import App, { type StateProps, type DispatchProps, type Props } from './color'
import {
    type AppState,
    colorEventReceived,
    failure,
    colorUnsubscribed
} from '../reducer'
import {
    subscribe,
    unsubscribe,
    type SubscriptionPayload
} from 'redux-graphql-subscriptions'

const mapStateToProps: * = (state: AppState): StateProps => ({
    color: state.color
})

const query: string = `
    subscription Color($channel: String!) {
        color(channel: $channel)
    }
`
const PUB_SUB_CHANNEL: string = 'color'

const variables = {
    channel: PUB_SUB_CHANNEL
}

const subscription: SubscriptionPayload = {
    query,
    variables,
    onMessage: colorEventReceived,
    onError: failure,
    onUnsubscribe: colorUnsubscribed
}

const mapDispatchToProps: * = (dispatch: *): DispatchProps => ({
    subscribe: (): ReduxAction<*> => dispatch(subscribe(subscription)),
    unsubscribe: (): ReduxAction<*> => dispatch(unsubscribe(PUB_SUB_CHANNEL))
})
const connectApp: (ComponentType<Props>) => ComponentType<{}> = connect(
    mapStateToProps,
    mapDispatchToProps
)

export default connectApp(App)
