import { GraphQLString } from 'graphql'
import { PubSub } from 'graphql-subscriptions'

export const color = (pubsub: PubSub) => {
  let CHANNEL_ID = '*'

  setInterval(() => {
    pubsub.publish(CHANNEL_ID, {
      color: randomColor(),
    })
  }, 500)

  return {
    type: GraphQLString,
    subscribe: (_: any, __: any, ctx: { id: string }) => {
      console.log(`Subscribed to ${ctx.id}`)
      CHANNEL_ID = `color-${ctx.id}`

      return pubsub.asyncIterator(CHANNEL_ID)
    },
  }
}

function randomColor() {
  const red = getRandomHex()
  const green = getRandomHex()
  const blue = getRandomHex()

  return `#${red}${green}${blue}`
}

function getRandomHex() {
  return Math.floor(Math.random() * 256)
    .toString(16)
    .padStart(2, '0')
}
