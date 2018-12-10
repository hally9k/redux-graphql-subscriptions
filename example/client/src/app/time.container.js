import { connect } from 'react-redux'
import { failure, timeEventReceived, timeUnsubscribed } from '../reducer'
import App from './time'
import { subscribe, unsubscribe } from 'redux-graphql-subscriptions'

const mapStateToProps = (state) => ({
    time: state.time
})
const query = `
    subscription Time {
        time
    }
`
const subscriptionKey = 'time'
const subscription = {
    key: subscriptionKey,
    query,
    variables: {},
    onMessage: timeEventReceived,
    onError: failure,
    onUnsubscribe: timeUnsubscribed
}
const mapDispatchToProps = (dispatch) => ({
    subscribe: () => dispatch(subscribe(subscription)),
    unsubscribe: () => dispatch(unsubscribe(subscriptionKey))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App)
