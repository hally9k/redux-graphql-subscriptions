import React, { useCallback } from 'react'
import format from 'date-fns/format'
import { SubscribeAction, UnsubscribeAction } from '../../../../src'

export interface DispatchProps {
  subscribe: () => SubscribeAction
  unsubscribe: () => UnsubscribeAction
}

export interface StateProps {
  time: number
}

export interface Props extends StateProps, DispatchProps {}

export default function Time(props: Props) {
  const { time, subscribe, unsubscribe } = props

  const handleSubscribe = useCallback(() => subscribe(), [])
  const handleUnsubscribe = useCallback(unsubscribe, [])

  return (
    <div>
      <h3>What is the time?</h3>
      <h3>{time ? format(time, 'H:mm:ss A') : '?'}</h3>
      <button onClick={handleSubscribe}>Subscribe</button>
      <button onClick={handleUnsubscribe}>Unubscribe</button>
    </div>
  )
}
