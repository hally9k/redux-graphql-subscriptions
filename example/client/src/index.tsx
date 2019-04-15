import App from './app'
import React from 'react'
import ReactDom from 'react-dom'
import { composeWithDevTools } from 'redux-devtools-extension'
import { applyMiddleware, createStore } from 'redux'
import reducer, { AppState } from './reducer'
import { Provider } from 'react-redux'
import { WEBSOCKET_URL } from './config'
import {
  connect,
  createMiddleware,
  ConnectionPayload,
} from 'redux-graphql-subscriptions'
import { createLogger } from 'redux-logger'

const connectionPayload: ConnectionPayload = {
  options: {
    reconnect: true,
    connectionParams: {
      token: '^$%%$@^%^O*^&UE$%#T%Y',
    },
    connectionCallback: error => {
      console.log(error)
    },
  },
  url: WEBSOCKET_URL,
}

const enhancer = composeWithDevTools(
  applyMiddleware(createMiddleware<AppState>(), createLogger())
)
const store = createStore(reducer, enhancer)

store.dispatch(connect(connectionPayload))

const rootElement: HTMLDivElement = document.querySelector('#root')

ReactDom.render(
  <Provider store={store}>
    <App />
  </Provider>,
  rootElement
)
