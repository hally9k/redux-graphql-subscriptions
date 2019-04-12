import { GraphQLFloat } from 'graphql'

export const time = (pubsub: any) => {
  let CHANNEL_ID = '_'

  setInterval(() => {
    pubsub.publish(CHANNEL_ID, {
      time: Date.now(),
    })
  }, 1000)

  return {
    type: GraphQLFloat,
    subscribe: (_: any, variables: any, ctx: any) => {
      console.log(`Subscribed to ${ctx.id}`)
      CHANNEL_ID = `time-${ctx.id}`

      return pubsub.asyncIterator(CHANNEL_ID)
    },
  }
}
