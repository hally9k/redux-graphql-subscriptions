import { GraphQLFloat } from 'graphql'
import { PubSub } from 'graphql-subscriptions'

export const time = (pubsub: PubSub) => {
  let CHANNEL_ID = '_'

  setInterval(() => {
    pubsub.publish(CHANNEL_ID, {
      time: Date.now(),
    })
  }, 1000)

  return {
    type: GraphQLFloat,
    subscribe: (_: any, __: any, ctx: { id: string }) => {
      console.log(`Subscribed to ${ctx.id}`)
      CHANNEL_ID = `time-${ctx.id}`

      return pubsub.asyncIterator(CHANNEL_ID)
    },
  }
}
