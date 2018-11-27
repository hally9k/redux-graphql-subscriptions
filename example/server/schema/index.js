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

let TIME_SUBSCRIPTION_CHANNEL = "_";

setInterval(() => {
  pubsub.publish(TIME_SUBSCRIPTION_CHANNEL, {
    [TIME_SUBSCRIPTION_CHANNEL]: Date.now()
  });
}, 1000);

let COLOR_SUBSCRIPTION_CHANNEL = "*";

setInterval(() => {
  pubsub.publish(COLOR_SUBSCRIPTION_CHANNEL, {
    [COLOR_SUBSCRIPTION_CHANNEL]: randomColor()
  });
}, 500);

function randomColor() {
  const red = getRandomHex();
  const green = getRandomHex();
  const blue = getRandomHex();

  return `#${red}${green}${blue}`;
}

function getRandomHex() {
  return Math.floor(Math.random() * 256)
    .toString(16)
    .padStart(2, "0");
}

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
          TIME_SUBSCRIPTION_CHANNEL = channel;
          return pubsub.asyncIterator(TIME_SUBSCRIPTION_CHANNEL);
        }
      },
      color: {
        type: GraphQLString,
        args: {
          channel: { type: new GraphQLNonNull(GraphQLString) }
        },
        subscribe: (_, { channel }, { redis }) => {
          COLOR_SUBSCRIPTION_CHANNEL = channel;
          return pubsub.asyncIterator(COLOR_SUBSCRIPTION_CHANNEL);
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
