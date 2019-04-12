import { connect } from 'react-redux'
import { failure, timeEventReceived, timeUnsubscribed } from '../reducer'
import App, { StateProps, DispatchProps } from './time'

import { Dispatch } from 'redux'
import { subscribe, unsubscribe, SubscriptionPayload } from '../../../../src'
import { AppState } from '../reducer'
import { SubscribeAction, UnsubscribeAction } from '../../../../src'

const query = `
    subscription Time {
        time
    }
`
const subscriptionKey = 'time'
const subscription: SubscriptionPayload = {
  key: subscriptionKey,
  query,
  variables: {},
  onMessage: timeEventReceived,
  onError: failure,
  onUnsubscribe: timeUnsubscribed,
}

const mapStateToProps = (state: Pick<AppState, 'time'>): StateProps => ({
  time: state.time,
})

const mapDispatchToProps = (
  dispatch: Dispatch<SubscribeAction | UnsubscribeAction>
): DispatchProps => ({
  subscribe: () => dispatch(subscribe(subscription)),
  unsubscribe: () => dispatch(unsubscribe(subscriptionKey)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
