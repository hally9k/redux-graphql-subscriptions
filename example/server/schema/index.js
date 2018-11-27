// @flow

import { PubSub } from "graphql-subscriptions";
export const pubsub = new PubSub();

import {
  GraphQLInt,
  GraphQLFloat,
  GraphQLObjectType,
  GraphQLSchema
} from "graphql";

const SUBSCRIPTION_CHANNEL = "subscriptions";

const schema = new GraphQLSchema({
  subscription: new GraphQLObjectType({
    name: "RootSubscriptionType",
    fields: {
      time: {
        type: GraphQLFloat,
        subscribe: (_, __, { redis }) => {
          if (redis.sub.subscription_set[SUBSCRIPTION_CHANNEL]) {
            pubsub.unsubscribe(SUBSCRIPTION_CHANNEL);
          } else {
            redis.sub.subscribe(SUBSCRIPTION_CHANNEL);
            redis.sub.on("message", function(channel, message) {
              pubsub.publish(SUBSCRIPTION_CHANNEL, {
                [SUBSCRIPTION_CHANNEL]: message
              });
            });
          }

          return pubsub.asyncIterator(SUBSCRIPTION_CHANNEL);
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
