import { connect } from 'react-redux'
import App from './color'
import { colorEventReceived, colorUnsubscribed, failure } from '../reducer'
import { subscribe, unsubscribe } from 'redux-graphql-subscriptions'

const mapStateToProps = (state) => ({
    color: state.color
})
const query = `
    subscription Color {
        color
    }
`
const subscriptionKey = 'color'
const subscription = {
    key: subscriptionKey,
    query,
    variables: {},
    onMessage: colorEventReceived,
    onError: failure,
    onUnsubscribe: colorUnsubscribed
}
const mapDispatchToProps = (dispatch) => ({
    subscribe: () => dispatch(subscribe(subscription)),
    unsubscribe: () => dispatch(unsubscribe(subscriptionKey))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App)
