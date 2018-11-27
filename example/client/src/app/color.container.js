// @flow
import type { ComponentType } from 'react'
import { connect } from 'react-redux'
import { type AppState, colorEventReceived, failure } from '../reducer'
import App, { type StateProps, type DispatchProps, type Props } from './color'
import { subscribe, unsubscribe } from 'redux-graphql-subscriptions'

export type SubscriptionPayload = {
    query: string,
    variables: {},
    success: (_: *) => ReduxAction<*>,
    failure: (_: *) => ReduxAction<*>
}

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
    success: colorEventReceived,
    failure
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
