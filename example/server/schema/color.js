import { GraphQLNonNull, GraphQLString } from 'graphql'

export const color = (pubsub) => {
    let COLOR_SUBSCRIPTION_CHANNEL = '*'

    setInterval(() => {
        pubsub.publish(COLOR_SUBSCRIPTION_CHANNEL, {
            [COLOR_SUBSCRIPTION_CHANNEL]: randomColor()
        })
    }, 500)

    return {
        type: GraphQLString,
        args: {
            channel: { type: new GraphQLNonNull(GraphQLString) }
        },
        subscribe: (_, { channel }) => {
            console.log(`Subscribed to ${channel}`)
            COLOR_SUBSCRIPTION_CHANNEL = channel

            return pubsub.asyncIterator(COLOR_SUBSCRIPTION_CHANNEL)
        }
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
