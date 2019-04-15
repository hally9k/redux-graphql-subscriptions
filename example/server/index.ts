import cors from 'koa-cors'
import graphqlHTTP from 'koa-graphql'
import Koa from 'koa'
import mount from 'koa-mount'
import { createServer } from 'http'
import {
  SubscriptionServer,
  OperationMessage,
  ExecutionParams,
} from 'subscriptions-transport-ws'
import { execute, subscribe } from 'graphql'
import {
  WEBSOCKET_PATH,
  WEBSOCKET_URL,
  APP_URL,
  PORT,
} from '../client/src/config'

import schema from './schema'

const server = new Koa()

server.use(cors())

server.use(
  mount(
    '/graphql',
    graphqlHTTP({
      schema,
      graphiql: true,
      subscriptionsEndpoint: WEBSOCKET_URL,
      formatError: (error: { message: string; status: number }) => ({
        message: error.message,
        status: error.status,
      }),
    })
  )
)

const ws = createServer(server.callback())

ws.listen(PORT, () => {
  console.log(`Server is now running on ${APP_URL}...`)

  new SubscriptionServer(
    {
      execute,
      subscribe,
      schema,
      // Drop the message Id into the ctx for the pubsub channel
      onOperation: (message: OperationMessage, params: ExecutionParams) => ({
        ...params,
        context: { ...params.context, id: message.id },
      }),
      onConnect: (connectionParams: any) => {
        console.log('Connection established: ', connectionParams)
      },
      onDisconnect: () => {
        console.log('Disconnected')
      },
    },
    {
      server: ws,
      path: WEBSOCKET_PATH,
    }
  )
})
