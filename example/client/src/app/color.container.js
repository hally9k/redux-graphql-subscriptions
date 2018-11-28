import { connect } from 'react-redux'
import App from './color'
import { colorEventReceived, failure, colorUnsubscribed } from '../reducer'
import { subscribe, unsubscribe } from 'redux-graphql-subscriptions'

const mapStateToProps = state => ({
    color: state.color
})

const query = `
    subscription Color($channel: String!) {
        color(channel: $channel)
    }
`
const PUB_SUB_CHANNEL = 'color'

const variables = {
    channel: PUB_SUB_CHANNEL
}

const subscription = {
    query,
    variables,
    onMessage: colorEventReceived,
    onError: failure,
    onUnsubscribe: colorUnsubscribed
}

const mapDispatchToProps = dispatch => ({
    subscribe: () => dispatch(subscribe(subscription)),
    unsubscribe: () => dispatch(unsubscribe(PUB_SUB_CHANNEL))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App)
