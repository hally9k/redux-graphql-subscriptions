import { connect } from 'react-redux'
import { timeEventReceived, failure, timeUnsubscribed } from '../reducer'
import App from './time'
import { subscribe, unsubscribe } from 'redux-graphql-subscriptions'

const mapStateToProps = state => ({
    time: state.time
})

const query = `
    subscription Time($channel: String!) {
        time(channel: $channel)
    }
`
const PUB_SUB_CHANNEL = 'time'

const variables = {
    channel: PUB_SUB_CHANNEL
}

const subscription = {
    query,
    variables,
    onMessage: timeEventReceived,
    onError: failure,
    onUnsubscribe: timeUnsubscribed
}

const mapDispatchToProps = dispatch => ({
    subscribe: () => dispatch(subscribe(subscription)),
    unsubscribe: () => dispatch(unsubscribe(PUB_SUB_CHANNEL))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App)
