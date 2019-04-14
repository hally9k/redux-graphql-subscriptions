import { connect } from 'react-redux'
import { colorEventReceived, colorUnsubscribed, failure } from '../reducer'
import App, { StateProps, DispatchProps } from './color'
import { Dispatch } from 'redux'
import {
  subscribe,
  unsubscribe,
  SubscriptionPayload,
  SubscribeAction,
  UnsubscribeAction,
} from 'redux-graphql-subscriptions'
import { AppState } from '../reducer'

const query = `
subscription Color {
  color
}
`
const subscriptionKey = 'color'
const subscription: SubscriptionPayload = {
  key: subscriptionKey,
  query,
  variables: {},
  onMessage: colorEventReceived,
  onError: failure,
  onUnsubscribe: colorUnsubscribed,
}

const mapStateToProps = (state: Pick<AppState, 'color'>): StateProps => ({
  color: state.color,
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
