import * as subscriptionsTransportWs from 'subscriptions-transport-ws'
import {
  connect,
  createMiddleware,
  disconnect,
  subscribe,
  SubscriptionPayload,
  unsubscribe,
  WS_CLIENT_STATUS,
} from './index'

let connectedEventHandler: any

const mockUnsubscribe = jest.fn()
const mockClose = jest.fn()
const mockOnConnected = jest.fn(callback => {
  connectedEventHandler = callback
})
const mockGraphqlResponse = { data: {} }
const mockErrors: Array<any> = [{ message: 'Help!' }]
const mockGraphqlResponseWithError = {
  data: {},
  errors: mockErrors,
}
const mockSubscribe = jest.fn(({ next }) => {
  next(mockGraphqlResponse) // Pass a mock message to the observer
  next(mockGraphqlResponseWithError) // Pass a mock message to the observer with a error

  return { unsubscribe: mockUnsubscribe }
})
const mockRequest = jest.fn(() => ({
  subscribe: mockSubscribe,
}))
const mockWsClientStatus = WS_CLIENT_STATUS

jest.mock('subscriptions-transport-ws', () => ({
  SubscriptionClient: jest.fn().mockImplementation(() => {
    return {
      request: mockRequest,
      close: mockClose,
      status: mockWsClientStatus.CLOSED,
      onConnected: mockOnConnected,
    }
  }),
}))

describe('Redux Subscriptions Middleware', () => {
  const wsEndpointUrl: string = 'ws://api.example.com/subscriptions'
  const options = {
    reconnect: true,
  }
  const dispatch = jest.fn()
  const getState = jest.fn()
  const next = jest.fn()
  const middlewareFactory = createMiddleware()
  // Hold a single instance of the closed over values
  // @ts-ignore
  const middleware = middlewareFactory({ dispatch, getState })(next)
  const query: string = 'mock-query'
  const mockKey: string = 'test'
  const variables = {
    channel: 'channel',
  }
  const mockOnMessage = jest.fn()
  const mockOnError = jest.fn()
  const mockOnUnsubscribe = jest.fn()
  const payload: SubscriptionPayload = {
    key: mockKey,
    query,
    variables,
    onMessage: mockOnMessage,
    onError: mockOnError,
    onUnsubscribe: mockOnUnsubscribe,
  }
  const subscribeAction = subscribe(payload)
  const unSubscribeAction = unsubscribe(mockKey)

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial connection', () => {
    it('Passes all actions down the middleware chain', () => {
      const unhandledAction = { type: 'UNHANDLED' }

      middleware(unhandledAction)

      // Passes the action down the middleware chain
      expect(next).toBeCalledTimes(1)
      expect(next).toBeCalledWith(unhandledAction)
    })

    it('Handles the CONNECT action', () => {
      middleware(
        connect({
          url: wsEndpointUrl,
          options,
          protocols: 'scala-play-hack',
        })
      )
      expect(subscriptionsTransportWs.SubscriptionClient).toBeCalledTimes(1)
      expect(subscriptionsTransportWs.SubscriptionClient).toBeCalledWith(
        wsEndpointUrl,
        options,
        null,
        'scala-play-hack'
      )
      expect(mockOnConnected).toBeCalledWith(connectedEventHandler)
    })

    it("Handles subscription requests when the client isn't yet open and dispatches them when the `connected` event is emitted", () => {
      middleware(subscribeAction)
      expect(mockRequest).not.toBeCalled()

      connectedEventHandler()
      expect(dispatch).toBeCalledTimes(1)
      expect(dispatch).toBeCalledWith(subscribeAction, 0, [subscribeAction])
    })
  })

  describe('Once the client is open', () => {
    let middleware: any

    beforeAll(() => {
      jest.clearAllMocks()

      jest.resetModules()
      jest.doMock('subscriptions-transport-ws', () => ({
        SubscriptionClient: jest.fn().mockImplementation(() => {
          return {
            request: mockRequest,
            close: mockClose,
            status: mockWsClientStatus.OPEN,
            onConnected: mockOnConnected,
          }
        }),
      }))
      const { createMiddleware } = require('./index.ts')

      middleware = createMiddleware()({
        dispatch,
        getState,
      })(next)

      middleware(
        connect({
          url: wsEndpointUrl,
          options,
          protocols: 'scala-play-hack',
        })
      )
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('Handles the SUBSCRIBE action', () => {
      middleware(subscribeAction)

      // Make sure that duplicate requests are handled, it shouldn't do everything twice.
      middleware(subscribeAction)

      // Make request to subscribe
      expect(mockRequest).toBeCalledTimes(1)
      expect(mockRequest).toBeCalledWith({ query, variables })

      // Subscribe to messages on the request
      expect(mockSubscribe).toBeCalledTimes(1)

      // Dispatch the given onMessage action when receiving a graphql response
      expect(mockOnMessage).toBeCalledTimes(1)
      expect(mockOnMessage).toBeCalledWith(mockGraphqlResponse)
      expect(dispatch).toBeCalledWith(mockOnMessage(mockGraphqlResponse))

      // Dispatch the given onError action when receiving a graphql response with an error
      expect(mockOnError).toBeCalledTimes(1)
      expect(mockOnError).toBeCalledWith(mockErrors)
      expect(dispatch).toBeCalledWith(mockOnError(mockErrors))

      // Passes the action down the middleware chain
      expect(next).toBeCalledTimes(3)
      expect(next).toBeCalledWith(subscribeAction)
    })

    it('Handles the UNSUBSCRIBE action', () => {
      middleware(unSubscribeAction)

      // Make sure that duplicate requests are handled, it shouldn't do everything twice.
      middleware(unSubscribeAction)

      expect(mockUnsubscribe).toBeCalledTimes(1)
      expect(mockOnUnsubscribe).toBeCalledTimes(1)
      expect(dispatch).toBeCalledWith(mockOnUnsubscribe())

      // Passes the action down the middleware chain
      expect(next).toBeCalledTimes(2)
      expect(next).toBeCalledWith(unSubscribeAction)
    })

    it('Handles the DISCONNECT action', () => {
      middleware(disconnect())
      expect(mockClose).toBeCalledTimes(1)
    })
  })
})
