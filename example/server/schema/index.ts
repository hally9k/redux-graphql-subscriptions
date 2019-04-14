import { PubSub } from 'graphql-subscriptions'
export const pubsub = new PubSub()

import { GraphQLFloat, GraphQLObjectType, GraphQLSchema } from 'graphql'

import { color } from './color'
import { time } from './time'

const schema = new GraphQLSchema({
  subscription: new GraphQLObjectType({
    name: 'RootSubscriptionType',
    fields: {
      time: time(pubsub),
      color: color(pubsub),
    },
  }),
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      time: {
        type: GraphQLFloat,
        resolve: () => {
          return Date.now()
        },
      },
    },
  }),
})

export default schema
