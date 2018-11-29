import { GraphQLFloat, GraphQLNonNull, GraphQLString } from 'graphql'

export const time = (pubsub) => {
    let TIME_SUBSCRIPTION_CHANNEL = '_'

    setInterval(() => {
        pubsub.publish(TIME_SUBSCRIPTION_CHANNEL, {
            [TIME_SUBSCRIPTION_CHANNEL]: Date.now()
        })
    }, 1000)

    return {
        type: GraphQLFloat,
        args: {
            channel: { type: new GraphQLNonNull(GraphQLString) }
        },
        subscribe: (_, { channel }) => {
            console.log(`Subscribed to ${channel}`)
            TIME_SUBSCRIPTION_CHANNEL = channel

            return pubsub.asyncIterator(TIME_SUBSCRIPTION_CHANNEL)
        }
    }
}
