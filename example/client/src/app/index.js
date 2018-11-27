// @flow
import type { ComponentType } from 'react'
import { connect } from 'react-redux'
import { type AppState, timeEventReceived, failure } from '../reducer'
import App, { type StateProps, type DispatchProps, type Props } from './app'
import { subscribe, unsubscribe } from 'redux-graphql-subscriptions'

export type SubscriptionPayload = {
    query: string,
    variables: {},
    success: (_: *) => ReduxAction<*>,
    failure: (_: *) => ReduxAction<*>
}

const mapStateToProps: * = (state: AppState): StateProps => ({
    time: state.time
})

const query: string = `
    subscription Time($channel: String!) {
        time(channel: $channel)
    }
`
const PUB_SUB_CHANNEL: string = 'time'

const variables = {
    channel: PUB_SUB_CHANNEL
}

const subscription: SubscriptionPayload = {
    query,
    variables,
    success: timeEventReceived,
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
