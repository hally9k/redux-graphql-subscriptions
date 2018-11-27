// @flow

export type AppState = {
    time: number
}

const TIME_EVENT_RECEIVED: string = 'example-app/TIME_EVENT_RECEIVED'
const COLOR_EVENT_RECEIVED: string = 'example-app/COLOR_EVENT_RECEIVED'
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

export const colorEventReceived: * = (
    payload: ColorEventPayload
): ReduxAction<string> => ({
    type: COLOR_EVENT_RECEIVED,
    payload: payload.data.color
})

export const failure: * = (
    payload: GraphQLError
): ReduxAction<GraphQLError> => ({
    type: FAILURE,
    payload
})

const INITIAL_STATE: AppState = { time: 0, color: '#AFAFAF' }

export default function(
    state: AppState = INITIAL_STATE,
    action: ReduxAction<number> & ReduxAction<string>
): AppState {
    const { type, payload }: ReduxAction<number> & ReduxAction<string> = action

    switch (type) {
        case TIME_EVENT_RECEIVED:
            return { ...state, time: payload }

        case COLOR_EVENT_RECEIVED:
            return { ...state, color: payload }

        default:
            return state
    }
}
