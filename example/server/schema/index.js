// @flow

import { PubSub } from "graphql-subscriptions";
export const pubsub = new PubSub();

import {
  GraphQLInt,
  GraphQLFloat,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLString
} from "graphql";

let SUBSCRIPTION_CHANNEL = "_";

setInterval(() => {
  pubsub.publish(SUBSCRIPTION_CHANNEL, {
    [SUBSCRIPTION_CHANNEL]: Date.now()
  });
}, 1000);

const schema = new GraphQLSchema({
  subscription: new GraphQLObjectType({
    name: "RootSubscriptionType",
    fields: {
      time: {
        type: GraphQLFloat,
        args: {
          channel: { type: new GraphQLNonNull(GraphQLString) }
        },
        subscribe: (_, { channel }, { redis }) => {
          SUBSCRIPTION_CHANNEL = channel;
          return pubsub.asyncIterator(channel);
        }
      }
    }
  }),
  query: new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
      time: {
        type: GraphQLFloat,
        resolve: (_, __, ctx) => {
          return ctx.time.epoch();
        }
      }
    }
  })
});

export default schema;
