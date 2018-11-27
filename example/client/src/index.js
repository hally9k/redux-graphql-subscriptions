// @flow
import React from 'react'
import ReactDom from 'react-dom'
import App from './app'
import { composeWithDevTools } from 'redux-devtools-extension'
import { applyMiddleware, createStore } from 'redux'
import reducer from './reducer'
import { Provider } from 'react-redux'
import createGraphQLSubscriptionsMiddleware from 'redux-graphql-subscriptions'
import { createLogger } from 'redux-logger'

const subscriptionsUrl: string = 'ws://localhost:8081/subscriptions'
const subscriptionOptions: * = {
    reconnect: true
}

const enhancer: * = composeWithDevTools(
    applyMiddleware(
        createGraphQLSubscriptionsMiddleware(
            subscriptionsUrl,
            subscriptionOptions
        ),
        createLogger()
    )
)

const store = createStore(reducer, { time: 0 }, enhancer)

const rootElement: HTMLElement =
    document.getElementById('root') || document.getElementsByTagName('BODY')[0]

ReactDom.render(
    <Provider store={store}>
        <App />
    </Provider>,
    rootElement
)