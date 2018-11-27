// @flow

export type AppState = {
    time: number
}

const TIME_EVENT_RECEIVED: string = 'example-app/TIME_EVENT_RECEIVED'
const FAILURE: string = 'example-app/FAILURE'

type TimeEventPayload = {
    data: {
        time: number
    }
}

export const timeEventReceived: * = (
    payload: TimeEventPayload
): ReduxAction<number> => ({
    type: TIME_EVENT_RECEIVED,
    payload: payload.data.time
})

export const failure: * = (
    payload: GraphQLError
): ReduxAction<GraphQLError> => ({
    type: FAILURE,
    payload
})

const INITIAL_STATE: AppState = { time: 0 }

export default function(
    state: AppState = INITIAL_STATE,
    action: ReduxAction<number>
): AppState {
    const { type, payload }: ReduxAction<number> = action

    switch (type) {
        case TIME_EVENT_RECEIVED:
            return { time: payload }

        default:
            return state
    }
}
