import React from 'react'
import ReactDom from 'react-dom'
import App from './app'
import { composeWithDevTools } from 'redux-devtools-extension'
import { applyMiddleware, createStore } from 'redux'
import reducer from './reducer'
import { Provider } from 'react-redux'
import { connect, createMiddleware } from 'redux-graphql-subscriptions'
import { createLogger } from 'redux-logger'

const subscriptionsUrl = 'ws://localhost:8081/subscriptions'
const subscriptionOptions = {
    reconnect: true,
    connectionParams: {
        token: '^$%%$@^%^O*^&UE$%#T%Y'
    },
    connectionCallback: (error) => {
        console.log(error)
    }
}
const enhancer = composeWithDevTools(
    applyMiddleware(
        createMiddleware(subscriptionsUrl, subscriptionOptions),
        createLogger()
    )
)
const store = createStore(reducer, enhancer)

store.dispatch(connect())

const rootElement: HTMLElement =
    document.getElementById('root') || document.getElementsByTagName('BODY')[0]

ReactDom.render(
    <Provider store={store}>
        <App />
    </Provider>,
    rootElement
)
