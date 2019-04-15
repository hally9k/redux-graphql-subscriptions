import { ExecutionResult } from 'graphql'
import { FSA as Action } from 'flux-standard-action'
import { GraphQLError } from 'graphql'
import { ReduxGraphQLSubscriptionActionUnion } from 'redux-graphql-subscriptions'

const TIME_EVENT_RECEIVED = 'example-app/TIME_EVENT_RECEIVED'
type TimeEventRecievedAction = Action<typeof TIME_EVENT_RECEIVED, number>
export const timeEventReceived = (
  message: ExecutionResult<{ time: number }>
): TimeEventRecievedAction => ({
  type: TIME_EVENT_RECEIVED,
  payload: message.data.time,
})

const TIME_UNSUBSCRIBED = 'example-app/TIME_UNSUBSCRIBED'
type TimeUnsubscribedAction = Action<typeof TIME_UNSUBSCRIBED>
export const timeUnsubscribed = (): TimeUnsubscribedAction => ({
  type: TIME_UNSUBSCRIBED,
})

const COLOR_EVENT_RECEIVED = 'example-app/COLOR_EVENT_RECEIVED'
type ColorEventReceivedAction = Action<typeof COLOR_EVENT_RECEIVED, string>
export const colorEventReceived = (
  message: ExecutionResult<{ color: string }>
): ColorEventReceivedAction => ({
  type: COLOR_EVENT_RECEIVED,
  payload: message.data.color,
})

const COLOR_UNSUBSCRIBED = 'example-app/COLOR_UNSUBSCRIBED'
type ColorUnsubscribedAction = Action<typeof COLOR_UNSUBSCRIBED>
export const colorUnsubscribed = (): ColorUnsubscribedAction => ({
  type: COLOR_UNSUBSCRIBED,
})

const FAILURE = 'example-app/FAILURE'
type FailureAction = Action<typeof FAILURE, GraphQLError[]>
export const failure = (payload: GraphQLError[]): FailureAction => ({
  type: FAILURE,
  payload,
  error: true,
})

const DEFAULT_TIME = 0
const DEFAULT_COLOR = '#AFAFAF'

export type AppState = { time: number; color: string }
const INITIAL_STATE: AppState = { time: DEFAULT_TIME, color: DEFAULT_COLOR }

type ActionUnion =
  | TimeEventRecievedAction
  | TimeUnsubscribedAction
  | ColorEventReceivedAction
  | ColorUnsubscribedAction
  | FailureAction
  | ReduxGraphQLSubscriptionActionUnion // Note that to strongly type the actions in our store we must add redux-graphql-subscription's middleware's actions to the store's action union.

export default function(state: AppState = INITIAL_STATE, action: ActionUnion) {
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
