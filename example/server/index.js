import cors from "koa-cors";
import graphqlHTTP from "koa-graphql";
import Koa from "koa";
import mount from "koa-mount";
import { createServer } from "http";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { execute, subscribe } from "graphql";

import schema from "./schema/index.js";
import redis from "./connector/redis.js";
import { time } from "./model/index.js";

const context = {
  redis,
  time
};

const DEFAULT_PORT = 8081;

const PORT = process.env.PORT || DEFAULT_PORT;

const server = new Koa();

server.use(cors());

server.use(
  mount(
    "/graphql",
    graphqlHTTP({
      schema,
      graphiql: true,
      context,
      subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`,
      formatError: error => ({
        message: error.message,
        status: error.status
      })
    })
  )
);

const ws = createServer(server.callback());

ws.listen(PORT, () => {
  console.log(`Server is now running on http://localhost:${PORT}...`);

  new SubscriptionServer(
    {
      execute,
      subscribe,
      schema,
      onConnect: () => {
        return context;
      }
    },
    {
      server: ws,
      path: "/subscriptions"
    }
  );
});
