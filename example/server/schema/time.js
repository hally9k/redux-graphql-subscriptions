import { GraphQLFloat, GraphQLString } from 'graphql'

export const time = (pubsub) => {
    let CHANNEL_ID = '_'

    setInterval(() => {
        pubsub.publish(CHANNEL_ID, {
            time: Date.now()
        })
    }, 1000)

    return {
        type: GraphQLFloat,
        subscribe: (_, variables, ctx) => {
            console.log(`Subscribed to ${ctx.id}`)
            CHANNEL_ID = `time-${ctx.id}`

            return pubsub.asyncIterator(CHANNEL_ID)
        }
    }
}
