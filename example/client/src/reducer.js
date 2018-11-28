// @flow

export type AppState = {
    time: number,
    color: string
}

const TIME_EVENT_RECEIVED: string = 'example-app/TIME_EVENT_RECEIVED'
const TIME_UNSUBSCRIBED: string = 'example-app/TIME_UNSUBSCRIBED'
const COLOR_EVENT_RECEIVED: string = 'example-app/COLOR_EVENT_RECEIVED'
const COLOR_UNSUBSCRIBED: string = 'example-app/COLOR_UNSUBSCRIBED'
const FAILURE: string = 'example-app/FAILURE'

type TimeEventPayload = {
    data: {
        time: number
    }
}

type ColorEventPayload = {
    data: {
        color: string
    }
}

export const timeEventReceived: * = (
    payload: TimeEventPayload
): ReduxAction<number> => ({
    type: TIME_EVENT_RECEIVED,
    payload: payload.data.time
})

export const timeUnsubscribed: * = (): ReduxAction<*> => ({
    type: TIME_UNSUBSCRIBED
})

export const colorEventReceived: * = (
    payload: ColorEventPayload
): ReduxAction<string> => ({
    type: COLOR_EVENT_RECEIVED,
    payload: payload.data.color
})

export const colorUnsubscribed: * = (): ReduxAction<*> => ({
    type: COLOR_UNSUBSCRIBED
})

export const failure: * = (
    payload: GraphQLError
): ReduxAction<GraphQLError> => ({
    type: FAILURE,
    payload
})

const DEFAULT_TIME = 0
const DEFAULT_COLOR = '#AFAFAF'

const INITIAL_STATE: AppState = { time: DEFAULT_TIME, color: DEFAULT_COLOR }

export default function(
    state: AppState = INITIAL_STATE,
    action: ReduxAction<number & string>
): AppState {
    const { type, payload }: ReduxAction<number & string> = action

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
