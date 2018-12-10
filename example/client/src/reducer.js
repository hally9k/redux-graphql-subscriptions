const TIME_EVENT_RECEIVED = 'example-app/TIME_EVENT_RECEIVED'
const TIME_UNSUBSCRIBED = 'example-app/TIME_UNSUBSCRIBED'
const COLOR_EVENT_RECEIVED = 'example-app/COLOR_EVENT_RECEIVED'
const COLOR_UNSUBSCRIBED = 'example-app/COLOR_UNSUBSCRIBED'
const FAILURE = 'example-app/FAILURE'

export const timeEventReceived = (payload) => ({
    type: TIME_EVENT_RECEIVED,
    payload: payload.data.time
})

export const timeUnsubscribed = () => ({
    type: TIME_UNSUBSCRIBED
})

export const colorEventReceived = (payload) => ({
    type: COLOR_EVENT_RECEIVED,
    payload: payload.data.color
})

export const colorUnsubscribed = () => ({
    type: COLOR_UNSUBSCRIBED
})

export const failure = (payload) => ({
    type: FAILURE,
    payload
})

const DEFAULT_TIME = 0
const DEFAULT_COLOR = '#AFAFAF'
const INITIAL_STATE = { time: DEFAULT_TIME, color: DEFAULT_COLOR }

export default function(state = INITIAL_STATE, action) {
    const { type, payload } = action

    switch (type) {
        case TIME_EVENT_RECEIVED:
            return { ...state, time: payload }

        case TIME_UNSUBSCRIBED:
            return { ...state, time: DEFAULT_TIME }

        case COLOR_EVENT_RECEIVED:
            return { ...state, color: payload }

        case COLOR_UNSUBSCRIBED:
            return { ...state, color: DEFAULT_COLOR }

        default:
            return state
    }
}
