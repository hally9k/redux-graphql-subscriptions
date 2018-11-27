import redis from "redis";

const config = {
  host: "localhost",
  port: 6379
};

export default {
  sub: redis.createClient(config),
  pub: redis.createClient(config)
};
